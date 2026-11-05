(function () {
  'use strict';

  var config = window.KBK_APP_CONFIG || {};
  var sheetIds = window.KBK_PUBLIC_SHEET_IDS || {};
  var isEnglish = new URLSearchParams(window.location.search).get('lang') === 'en';
  var shared = window.KBKShared;
  var pinReset = window.KBKPinReset.attach({webAppUrl: config.webAppUrl});

  var posts = [];
  var comments = [];
  var polls = [];
  var votes = [];
  var pendingOperation = null;
  var boardLoadFailed = false;

  var filter = { type: 'all', tags: [] };
  var tagFiltersOpen = false;
  var sort = { field: 'activity', dir: 'desc' };

  var boardView = document.getElementById('boardEntries');
  var notice = document.getElementById('boardNotice');
  var scrim = document.getElementById('boardScrim');
  var boardDetail = document.getElementById('boardDetail');
  var boardDialog = document.getElementById('boardDialog');
  var dialogTitle = document.getElementById('dialogTitle');
  var operationFields = document.getElementById('operationFields');
  var dialogMessage = document.getElementById('dialogMessage');
  var submitButton = document.getElementById('dialogSubmit');
  var closeButton = document.getElementById('dialogClose');
  var cancelButton = document.getElementById('dialogCancel');
  var closeDialogFocus = null;
  var closeDetailFocus = null;

  var auth = window.KBKQrAuth.create({
    mountId: 'boardAuth',
    pinFieldIds: ['boardPinFields'],
    loginInputId: 'boardLogin',
    pinInputId: 'boardPin',
    confirmButtonId: 'dialogSubmit',
    methodLabel: 'Potwierdzam działanie za pomocą:',
    qrLabel: 'Kod QR',
    scanOnSelect: false,
    onModeChange: updateSubmitLabel,
    onScanStateChange: setScanning,
    onQrScan: function (qrHash) { submitPending(qrHash); }
  });

  // ---------- helpers -------------------------------------------------

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char];
    });
  }

  function cellValue(row, names) {
    var cell = shared.lookupCell(row, names);
    if (cell && typeof cell === 'object') {
      if (cell.v !== undefined && cell.v !== null) return cell.v;
      if (cell.f !== undefined && cell.f !== null) return cell.f;
    }
    return cell == null ? '' : cell;
  }

  function cellText(row, names) {
    return shared.strFromCell(shared.lookupCell(row, names));
  }

  function dateValue(value) {
    if (value instanceof Date) return value;
    var match = /^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)$/.exec(String(value || ''));
    if (match) return new Date(Number(match[1]), Number(match[2]), Number(match[3]),
      Number(match[4] || 0), Number(match[5] || 0), Number(match[6] || 0));
    var parsed = new Date(value);
    return isNaN(parsed.getTime()) ? new Date(0) : parsed;
  }

  function dateLabel(value) {
    var date = dateValue(value);
    if (!date.getTime()) return '—';
    return new Intl.DateTimeFormat(isEnglish ? 'en-GB' : 'pl-PL', {
      dateStyle: 'medium', timeStyle: 'short'
    }).format(date);
  }

  function tagsHtml(value) {
    return String(value || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean)
      .map(function (tag) {
        return '<span class="tag">#' + esc(tag.replace(/^#+/, '')) + '</span>';
      }).join('');
  }

  function parseTags(value) {
    return String(value || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat(isEnglish ? 'en-US' : 'pl-PL', {maximumFractionDigits: 2}).format(value);
  }

  function voteCountLabel(count) {
    if (isEnglish) return count === 1 ? 'vote' : 'votes';
    if (count === 1) return 'głos';
    var lt = count % 100, ld = count % 10;
    return ld >= 2 && ld <= 4 && (lt < 12 || lt > 14) ? 'głosy' : 'głosów';
  }

  function commentCountLabel(count) {
    if (isEnglish) return count === 1 ? 'comment' : 'comments';
    if (count === 1) return 'komentarz';
    var lt = count % 100, ld = count % 10;
    return ld >= 2 && ld <= 4 && (lt < 12 || lt > 14) ? 'komentarze' : 'komentarzy';
  }

  function setNotice(message, type) {
    notice.textContent = message || '';
    notice.className = 'notice' + (type ? ' ' + type : '');
  }

  function getRows(sheetName) {
    if (!sheetIds.tablicaFileId) {
      return Promise.reject(new Error('Brak ID publicznego arkusza Tablica w konfiguracji frontendu.'));
    }
    return shared.loadSheetJSONP(sheetIds.tablicaFileId, sheetName, {
      cacheMs: 0, timeoutMs: 15000, forceReload: true
    }).then(function (table) { return shared.tableToObjects(table); });
  }

  function loadBoard() {
    boardLoadFailed = false;
    setNotice('Wczytywanie Tablicy…');
    return Promise.all([
      getRows('Posty'), getRows('Komentarze'), getRows('Ankiety'), getRows('Głosy')
    ]).then(function (tables) {
      posts = tables[0];
      comments = tables[1];
      polls = tables[2];
      votes = tables[3];
      renderEntries();
      setNotice('');
    }).catch(function (error) {
      boardLoadFailed = true;
      console.error('Nie udało się wczytać Tablicy.', error);
      setNotice(error.message || 'Nie udało się wczytać Tablicy.', 'error');
      boardView.innerHTML = '<div class="empty">Nie udało się wczytać wpisów.</div>';
    });
  }

  // ---------- ids / aggregation --------------------------------------

  function postId(row) { return cellText(row, ['ID_POSTA', 'ID posta']); }
  function commentId(row) { return cellText(row, ['ID_KOMENTARZA', 'ID komentarza']); }
  function pollId(row) { return cellText(row, ['ID_ANKIETY', 'ID ankiety']); }
  function loginOf(row) { return cellText(row, ['LOGIN_AUTORA', 'LOGIN', 'NAZWA_UŻYTKOWNIKA']); }
  function isPinned(row) { return cellText(row, ['Przypięty']).trim().toUpperCase() === 'TAK'; }

  function pollAnswers(poll) {
    try {
      var parsed = JSON.parse(cellText(poll, ['ODPOWIEDZI_JSON', 'ODPOWIEDZI']) || '[]');
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch (error) {
      console.error('Nieprawidłowy format odpowiedzi ankiety.', error);
      return [];
    }
  }

  function isMultipleChoicePoll(poll) {
    var type = cellText(poll, ['TYP']);
    return type === 'multiple' || type.indexOf('multiple_') === 0;
  }

  function allowsPollAnswers(poll) {
    return /_open$/.test(cellText(poll, ['TYP']));
  }

  function pollVotes(id) {
    return votes.filter(function (v) { return cellText(v, ['ID_ANKIETY']) === id; });
  }

  function postActivity(post) {
    var base = Math.max(
      dateValue(cellValue(post, ['DATA_UTWORZENIA'])).getTime(),
      dateValue(cellValue(post, ['OSTATNIA_AKTYWNOŚĆ'])).getTime() || 0
    );
    var pid = postId(post);
    comments.forEach(function (c) {
      if (cellText(c, ['ID_POSTA']) === pid) {
        base = Math.max(base, dateValue(cellValue(c, ['DATA_DODANIA'])).getTime() || 0);
      }
    });
    return base;
  }

  function pollActivity(poll) {
    return Math.max(
      dateValue(cellValue(poll, ['DATA_UTWORZENIA'])).getTime(),
      dateValue(cellValue(poll, ['OSTATNIA_AKTYWNOŚĆ'])).getTime() || 0
    );
  }

  function isPollClosed(poll) {
    var t = dateValue(cellValue(poll, ['DATA_ZAMKNIĘCIA', 'DATA_ZAMKNIECIA'])).getTime();
    return t > 0 && t <= Date.now();
  }

  function getAllEntries() {
    var all = [];
    posts.forEach(function (post) {
      if (!postId(post) || !cellText(post, ['TYTUŁ', 'TYTUL']) ||
          !cellText(post, ['TREŚĆ', 'TRESC'])) return;
      all.push({
        type: 'post', row: post, id: postId(post),
        tags: parseTags(cellText(post, ['TAGI'])),
        createdAt: dateValue(cellValue(post, ['DATA_UTWORZENIA'])).getTime(),
        activityAt: postActivity(post),
        pinned: isPinned(post)
      });
    });
    polls.forEach(function (poll) {
      if (!pollId(poll) || !cellText(poll, ['TYTUŁ', 'TYTUL']) ||
          !cellText(poll, ['PYTANIE'])) return;
      all.push({
        type: 'poll', row: poll, id: pollId(poll),
        tags: parseTags(cellText(poll, ['TAGI'])),
        createdAt: dateValue(cellValue(poll, ['DATA_UTWORZENIA'])).getTime(),
        activityAt: pollActivity(poll),
        pinned: isPinned(poll)
      });
    });
    return all;
  }

  function findEntry(type, id) {
    return getAllEntries().find(function (e) { return e.type === type && e.id === id; });
  }

  function entryMatchesFilter(entry) {
    if (filter.type !== 'all' && entry.type !== filter.type) return false;
    if (!filter.tags.length) return true;
    var lower = entry.tags.map(function (t) { return t.toLowerCase(); });
    for (var i = 0; i < filter.tags.length; i++) {
      if (lower.indexOf(filter.tags[i]) !== -1) return true;
    }
    return false;
  }

  function compareEntries(a, b) {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    var av = sort.field === 'created' ? a.createdAt : a.activityAt;
    var bv = sort.field === 'created' ? b.createdAt : b.activityAt;
    return sort.dir === 'asc' ? av - bv : bv - av;
  }

  // ---------- list rendering ------------------------------------------

  function renderEntries() {
    renderTagFilterChips();
    var entries = getAllEntries();
    var visible = entries.filter(entryMatchesFilter).sort(compareEntries);
    if (!visible.length) {
      boardView.innerHTML = '<div class="empty">' +
        (entries.length
          ? (isEnglish ? 'No entries match the criteria.' : 'Brak wpisów spełniających kryteria.')
          : (isEnglish
            ? 'There are no entries yet. Be the first to publish a post or poll!'
            : 'Nie ma tu jeszcze żadnych wpisów. Dodaj pierwszy post lub ankietę!')) +
        '</div>';
      return;
    }
    var pinned = visible.filter(function (entry) { return entry.pinned; });
    var regular = visible.filter(function (entry) { return !entry.pinned; });
    boardView.innerHTML = pinned.concat(regular).map(function (e, index) {
      var html = e.type === 'post' ? renderPostCard(e.row) : renderPollCard(e.row);
      if (pinned.length && index === pinned.length) {
        return '<div class="entries-separator">' + (isEnglish ? 'Other entries' : 'Pozostałe wpisy') + '</div>' + html;
      }
      return html;
    }).join('');
  }

  function shareLink(type, id) {
    var url = new URL(window.location.href);
    url.searchParams.delete('post');
    url.searchParams.delete('poll');
    url.searchParams.set(type === 'post' ? 'post' : 'poll', id);
    url.hash = '';
    return url.href;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    var input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    var copied = false;
    try { copied = document.execCommand('copy'); }
    finally { input.remove(); }
    return copied ? Promise.resolve() : Promise.reject(new Error('Schowek jest niedostępny.'));
  }

  function shareEntry(type, id) {
    var link = shareLink(type, id);
    Promise.resolve().then(function () { return copyText(link); }).then(function () {
      setNotice(isEnglish ? 'Link copied to clipboard.' : 'Link został skopiowany do schowka.', 'ok');
    }).catch(function (error) {
      console.error('Nie udało się skopiować linku do wpisu.', error);
      setNotice(isEnglish
        ? 'Could not copy the link. Copy it from the address bar: ' + link
        : 'Nie udało się skopiować linku. Skopiuj go z paska adresu: ' + link, 'error');
    });
  }

  function shareButtonHtml(type, id) {
    return '<button type="button" class="share-link-button" data-action="share-entry" ' +
      'data-share-type="' + esc(type) + '" data-share-id="' + esc(id) + '">' +
      (isEnglish ? 'Share' : 'Udostępnij') + '</button>';
  }

  function openLinkedEntry() {
    var params = new URLSearchParams(window.location.search);
    var post = params.get('post');
    var poll = params.get('poll');
    if (!post && !poll) return;
    if (boardLoadFailed) return;
    if (post && poll) {
      setNotice(isEnglish
        ? 'The link is invalid: it contains both a post and a poll.'
        : 'Link jest nieprawidłowy: zawiera jednocześnie post i ankietę.', 'error');
      return;
    }
    var type = post ? 'post' : 'poll';
    var entry = findEntry(type, post || poll);
    if (entry) {
      openDetail(entry);
      return;
    }
    setNotice(isEnglish
      ? 'The requested entry was not found. It may have been removed.'
      : 'Nie znaleziono wskazanego wpisu. Być może został usunięty.', 'error');
  }

  function renderTagFilterChips() {
    var tagFilterEl = document.getElementById('tagFilter');
    var tagFilterRow = document.getElementById('tagFilterRow');
    var tagFilterToggle = document.getElementById('tagFilterToggle');
    var tagFilterToggleLabel = document.getElementById('tagFilterToggleLabel');
    var activeTagFilters = document.getElementById('activeTagFilters');
    var tagFilterClear = document.getElementById('tagFilterClear');
    if (!tagFilterEl) return;
    var seen = {}, tags = [];
    getAllEntries().forEach(function (e) {
      e.tags.forEach(function (tag) {
        var k = tag.toLowerCase();
        if (!seen[k]) { seen[k] = tag; tags.push(tag); }
      });
    });
    tags.sort(function (a, b) { return a.localeCompare(b, 'pl'); });
    if (tagFilterRow) tagFilterRow.hidden = tags.length === 0;
    if (tags.length === 0) tagFiltersOpen = false;
    tagFilterEl.hidden = !tagFiltersOpen;
    if (tagFilterToggle) tagFilterToggle.setAttribute('aria-expanded', String(tagFiltersOpen));
    if (tagFilterToggleLabel) {
      tagFilterToggleLabel.textContent = filter.tags.length
        ? (isEnglish ? 'Tags · ' : 'Tagi · ') + filter.tags.length
        : (isEnglish ? 'Choose tags' : 'Wybierz tagi');
    }
    tagFilterEl.innerHTML = tags.map(function (tag) {
      var active = filter.tags.indexOf(tag.toLowerCase()) !== -1;
      return '<button type="button" class="tag-chip' + (active ? ' active' : '') +
        '" data-tag="' + esc(tag) + '" aria-pressed="' + (active ? 'true' : 'false') + '">#' +
        esc(tag) + '</button>';
    }).join('');
    if (activeTagFilters) {
      activeTagFilters.innerHTML = filter.tags.map(function (tag) {
        var label = '#' + tag;
        return '<button type="button" class="active-tag-chip" data-remove-tag="' + esc(tag) +
          '" aria-label="' + esc(isEnglish ? 'Remove filter ' + label : 'Usuń filtr ' + label) +
          '">' + esc(label) + '<span aria-hidden="true">×</span></button>';
      }).join('');
      activeTagFilters.setAttribute('aria-label', isEnglish ? 'Active tag filters' : 'Aktywne filtry tagów');
    }
    if (tagFilterClear) {
      tagFilterClear.hidden = filter.tags.length === 0;
      tagFilterClear.textContent = isEnglish ? 'Clear' : 'Wyczyść';
    }
  }

  function pinnedIconHtml() {
    return '<span class="pin-indicator" role="img" aria-label="' +
      (isEnglish ? 'Pinned' : 'Przypięty') + '" title="' + (isEnglish ? 'Pinned' : 'Przypięty') + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 9V4l1-1V2H7v1l1 1v5l-2 2v2h5v9h2v-9h5v-2l-2-2z"/></svg>' +
      '</span>';
  }

  function renderPostCard(post) {
    var id = postId(post);
    var pinned = isPinned(post);
    var title = cellText(post, ['TYTUŁ', 'TYTUL']);
    var content = cellText(post, ['TREŚĆ', 'TRESC']);
    var author = loginOf(post);
    var commentCount = comments.filter(function (c) { return cellText(c, ['ID_POSTA']) === id; }).length;
    var meta = esc(author) + ' · ' + esc(dateLabel(cellValue(post, ['DATA_UTWORZENIA'])));
    if (commentCount > 0) {
      meta += ' · <span>' + commentCount + ' ' + commentCountLabel(commentCount) + '</span>';
    }
    return '<article class="card' + (pinned ? ' is-pinned' : '') + '" data-entry-type="post" data-post-id="' + esc(id) + '">' +
      '<div class="card-top"><div>' +
      '<div class="card-kind-row"><div class="card-kind">post</div>' + (pinned ? pinnedIconHtml() : '') + '</div>' +
      '<h3 class="card-title"><button type="button" class="card-open">' + esc(title) + '</button></h3>' +
      '<div class="card-meta">' + meta + '</div>' +
      '</div><button type="button" class="card-share" data-share-type="post" data-share-id="' +
      esc(id) + '">' + (isEnglish ? 'Share' : 'Udostępnij') + '</button></div>' +
      (content ? '<p class="card-excerpt">' + esc(content) + '</p>' : '') +
      '<div class="tags">' + tagsHtml(cellText(post, ['TAGI'])) + '</div>' +
      '</article>';
  }

  function renderPollCard(poll) {
    var id = pollId(poll);
    var pinned = isPinned(poll);
    var title = cellText(poll, ['TYTUŁ', 'TYTUL']);
    var question = cellText(poll, ['PYTANIE']);
    var author = loginOf(poll);
    var closed = isPollClosed(poll);
    var voterCount = pollVotes(id).length;
    var meta = esc(author) + ' · ' + esc(dateLabel(cellValue(poll, ['DATA_UTWORZENIA'])));
    if (voterCount > 0) {
      meta += ' · <span>' + voterCount + ' ' + voteCountLabel(voterCount) + '</span>';
    }
    var badge = closed ? '<span class="card-badge closed">zakończona</span>' : '';
    return '<article class="card' + (closed ? ' is-closed' : '') + (pinned ? ' is-pinned' : '') +
      '" data-entry-type="poll" data-poll-id="' + esc(id) + '">' +
      '<div class="card-top"><div>' +
      '<div class="card-kind-row"><div class="card-kind poll">ankieta</div>' + (pinned ? pinnedIconHtml() : '') + '</div>' +
      '<h3 class="card-title"><button type="button" class="card-open">' + esc(title) + '</button></h3>' +
      '<div class="card-meta">' + meta + '</div>' +
      '</div><div class="card-tools">' + badge +
      '<button type="button" class="card-share" data-share-type="poll" data-share-id="' +
      esc(id) + '">' + (isEnglish ? 'Share' : 'Udostępnij') + '</button></div></div>' +
      (question ? '<p class="card-excerpt">' + esc(question) + '</p>' : '') +
      '<div class="tags">' + tagsHtml(cellText(poll, ['TAGI'])) + '</div>' +
      '</article>';
  }

  // ---------- detail rendering ----------------------------------------

  function renderPostDetail(post) {
    var id = postId(post);
    var title = cellText(post, ['TYTUŁ', 'TYTUL']);
    var content = cellText(post, ['TREŚĆ', 'TRESC']);
    var author = loginOf(post);
    var created = dateValue(cellValue(post, ['DATA_UTWORZENIA'])).getTime();
    var lastAct = dateValue(cellValue(post, ['OSTATNIA_AKTYWNOŚĆ'])).getTime();
    var wasEdited = lastAct > created;

    document.getElementById('detailKind').textContent = 'POST';

    var metaHtml =
      '<span class="detail-meta-text">' +
      esc(author) + ' · opublikowano ' + esc(dateLabel(cellValue(post, ['DATA_UTWORZENIA']))) +
      (wasEdited
        ? ' · <span class="detail-edited">edytowano ' +
          esc(dateLabel(cellValue(post, ['OSTATNIA_AKTYWNOŚĆ']))) + '</span>'
        : '') +
      '</span>' + shareButtonHtml('post', id);

    document.getElementById('detailMeta').innerHTML = metaHtml;
    document.getElementById('detailTitle').textContent = title;
    document.getElementById('detailBadge').innerHTML = '';
    document.getElementById('detailContentLabel').textContent = 'Treść';
    document.getElementById('detailContent').textContent = content;
    document.getElementById('detailTags').innerHTML = tagsHtml(cellText(post, ['TAGI']));

    var pollInfo = document.getElementById('detailPollInfo');
    pollInfo.hidden = true; pollInfo.innerHTML = '';
    var pollResults = document.getElementById('detailPollResults');
    pollResults.hidden = true; pollResults.innerHTML = '';

    document.getElementById('detailTopActions').innerHTML = '';

    var commentsForPost = comments.filter(function (c) {
      return cellText(c, ['ID_POSTA']) === id;
    }).sort(function (a, b) {
      return dateValue(cellValue(a, ['DATA_DODANIA'])).getTime() -
             dateValue(cellValue(b, ['DATA_DODANIA'])).getTime();
    });

    var commentsHtml = commentsForPost.map(function (comment) {
      var cCreated = dateValue(cellValue(comment, ['DATA_DODANIA'])).getTime();
      var cEdited = dateValue(cellValue(comment, ['OSTATNIA_AKTYWNOŚĆ'])).getTime();
      var edited = cEdited > cCreated;
      return '<div class="comment">' +
        '<div class="comment-meta">' +
        '<span class="comment-author">' + esc(loginOf(comment)) + '</span>' +
        '<span>·</span>' +
        '<span>' + esc(dateLabel(cellValue(comment, ['DATA_DODANIA']))) + '</span>' +
        (edited ? '<span>· edytowano ' +
          esc(dateLabel(cellValue(comment, ['OSTATNIA_AKTYWNOŚĆ']))) + '</span>' : '') +
        '</div>' +
        '<p class="comment-text">' + esc(cellText(comment, ['TREŚĆ', 'TRESC'])) + '</p>' +
        '</div>';
    }).join('') || '<p class="detail-empty">Brak komentarzy.</p>';

    document.getElementById('detailComments').innerHTML = commentsHtml;
    document.getElementById('detailCommentAction').innerHTML =
      '<button type="button" class="comment-add-btn" data-action="add-comment" ' +
      'data-post-id="' + esc(id) + '">+ Dodaj komentarz</button>';
    document.getElementById('detailCommentsSection').hidden = false;
  }

  function renderPollDetail(poll) {
    var id = pollId(poll);
    var title = cellText(poll, ['TYTUŁ', 'TYTUL']);
    var question = cellText(poll, ['PYTANIE']);
    var author = loginOf(poll);
    var closed = isPollClosed(poll);
    var closeCell = cellValue(poll, ['DATA_ZAMKNIĘCIA', 'DATA_ZAMKNIECIA']);
    var hasCloseDate = dateValue(closeCell).getTime() > 0;
    var weighted = String(cellText(poll, ['SPOSÓB_LICZENIA', 'SPOSOB_LICZENIA'])).toUpperCase() === 'RCR';
    var multipleChoice = isMultipleChoicePoll(poll);
    var allowsNewAnswers = allowsPollAnswers(poll);

    document.getElementById('detailKind').textContent = 'ANKIETA';
    document.getElementById('detailMeta').innerHTML =
      '<span class="detail-meta-text">' +
      esc(author) + ' · opublikowano ' + esc(dateLabel(cellValue(poll, ['DATA_UTWORZENIA']))) +
      (hasCloseDate
        ? ' · ' + (closed ? 'zakończona ' : 'termin: ') + esc(dateLabel(closeCell))
        : '') +
      '</span>' + shareButtonHtml('poll', id);

    document.getElementById('detailTitle').textContent = title;
    document.getElementById('detailBadge').innerHTML = closed
      ? '<span class="card-badge closed">zakończona</span>' : '';
    document.getElementById('detailContentLabel').textContent = 'Pytanie';
    document.getElementById('detailContent').textContent = question;
    document.getElementById('detailTags').innerHTML = tagsHtml(cellText(poll, ['TAGI']));

    var pollInfo = document.getElementById('detailPollInfo');
    pollInfo.hidden = false;
    pollInfo.innerHTML =
      '<div class="detail-info">' +
      '<span>' + (multipleChoice ? 'Wielokrotny wybór' : 'Jednokrotny wybór') + '</span>' +
      ' · <span>' + (allowsNewAnswers ? 'Ankieta otwarta' : 'Ankieta zamknięta') + '</span>' +
      ' · <span>' + (weighted ? 'Głosy ważone RCR' : 'Głosy bez wagi') + '</span>' +
      '</div>';

    var answers = pollAnswers(poll);
    var ballotRows = pollVotes(id);
    var stats = answers.map(function (answer) {
      var selected = ballotRows.filter(function (v) {
        return cellText(v, ['ODPOWIEDŹ', 'ODPOWIEDZ']) === answer;
      });
      var weight = selected.reduce(function (s, v) {
        return s + Number(cellValue(v, ['WAGA_RCR']) || 0);
      }, 0);
      var voters = selected.map(function (v) { return cellText(v, ['LOGIN']); })
        .filter(Boolean);
      return { answer: answer, count: selected.length, weight: weight, voters: voters };
    });
    var totalPrimary = stats.reduce(function (s, st) {
      return s + (weighted ? st.weight : st.count);
    }, 0);

    var results = document.getElementById('detailPollResults');
    results.hidden = false;
    results.innerHTML = stats.length ? stats.map(function (stat) {
      var primary = weighted ? stat.weight : stat.count;
      var percent = totalPrimary > 0 ? primary / totalPrimary * 100 : 0;
      var percentClamped = Math.max(0, Math.min(100, percent));
      var votersList = stat.voters.length
        ? stat.voters.map(function (v) { return '<span class="voter">' + esc(v) + '</span>'; }).join('')
        : '<span style="color:var(--paper-muted)">—</span>';
      var metaLeft = weighted
        ? stat.count + ' ' + voteCountLabel(stat.count) + ' · ' + formatNumber(stat.weight) + ' RCR'
        : stat.count + ' ' + voteCountLabel(stat.count) + ' · ' + formatNumber(stat.weight) + ' RCR';
      var toggleBtn = stat.voters.length
        ? '<button type="button" class="vote-row-toggle" data-action="toggle-voters">' +
          'Pokaż głosujących (' + stat.voters.length + ')</button>'
        : '';
      var votersBlock = stat.voters.length
        ? '<div class="vote-row-voters" hidden>' + votersList + '</div>'
        : '';
      return '<div class="vote-row">' +
        '<div class="vote-row-head">' +
        '<span class="vote-row-label">' + esc(stat.answer) + '</span>' +
        '<span class="vote-row-pct">' + percent.toFixed(1) + '%</span>' +
        '</div>' +
        '<div class="vote-row-bar"><div class="vote-row-bar-fill" style="width:' +
        percentClamped + '%"></div></div>' +
        '<div class="vote-row-meta">' +
        '<span>' + esc(metaLeft) + '</span>' +
        toggleBtn +
        '</div>' +
        votersBlock +
        '</div>';
    }).join('') : '<p class="detail-empty">' +
      (allowsNewAnswers
        ? 'Ta ankieta nie ma jeszcze odpowiedzi. Dodaj pierwszą, aby rozpocząć głosowanie.'
        : 'Ta ankieta nie ma jeszcze odpowiedzi.') +
      '</p>';

    var actions = [];
    if (!closed && allowsNewAnswers && answers.length < 20) {
      actions.push('<button type="button" data-action="add-poll-answer" data-poll-id="' +
        esc(id) + '">Dodaj odpowiedź</button>');
    }
    if (!closed && answers.length) {
      actions.push('<button type="button" data-action="vote" data-poll-id="' +
        esc(id) + '">Oddaj / zmień głos</button>');
    }
    document.getElementById('detailTopActions').innerHTML = actions.join('');

    document.getElementById('detailCommentsSection').hidden = true;
    document.getElementById('detailComments').innerHTML = '';
    document.getElementById('detailCommentAction').innerHTML = '';
  }

  // ---------- modals --------------------------------------------------

  function openDetail(entry) {
    if (!entry) return;
    if (entry.type === 'post') renderPostDetail(entry.row);
    else renderPollDetail(entry.row);
    scrim.classList.add('open');
    boardDetail.classList.add('open');
    boardDetail.removeAttribute('inert');
    boardDetail.setAttribute('aria-hidden', 'false');
    if (window.KBKDialog) {
      closeDetailFocus = window.KBKDialog.open(boardDetail, {
        initialFocus: '#detailTitle',
        onEscape: closeDetail
      });
    }
  }

  function closeDetail() {
    scrim.classList.remove('open');
    boardDetail.classList.remove('open');
    if (closeDetailFocus) {
      closeDetailFocus(true);
      closeDetailFocus = null;
    } else {
      boardDetail.setAttribute('inert', '');
      boardDetail.setAttribute('aria-hidden', 'true');
    }
  }

  function closeDialog() {
    scrim.classList.remove('open');
    boardDialog.classList.remove('open');
    if (closeDialogFocus) {
      closeDialogFocus(true);
      closeDialogFocus = null;
    } else {
      boardDialog.setAttribute('inert', '');
      boardDialog.setAttribute('aria-hidden', 'true');
    }
    auth.reset();
    pendingOperation = null;
  }

  // ---------- event delegation (list) --------------------------------

  boardView.addEventListener('click', function (event) {
    var shareButton = event.target.closest('[data-share-type][data-share-id]');
    if (shareButton) {
      event.preventDefault();
      event.stopPropagation();
      shareEntry(shareButton.dataset.shareType, shareButton.dataset.shareId);
      return;
    }
    var card = event.target.closest('.card[data-entry-type]');
    if (!card) return;
    var type = card.dataset.entryType;
    var id = type === 'post' ? card.dataset.postId : card.dataset.pollId;
    var entry = findEntry(type, id);
    if (entry) openDetail(entry);
  });

  // ---------- event delegation (detail) ------------------------------

  boardDetail.addEventListener('click', function (event) {
    var toggleBtn = event.target.closest('[data-action="toggle-voters"]');
    if (toggleBtn) {
      var row = toggleBtn.closest('.vote-row');
      var list = row ? row.querySelector('.vote-row-voters') : null;
      if (list) {
        var wasHidden = list.hidden;
        list.hidden = !wasHidden;
        var count = list.querySelectorAll('.voter').length;
        toggleBtn.textContent = wasHidden
          ? 'Ukryj głosujących'
          : 'Pokaż głosujących (' + count + ')';
      }
      return;
    }

    var button = event.target.closest('button[data-action]');
    if (!button) return;
    var action = button.dataset.action;

    if (action === 'share-entry') {
      shareEntry(button.dataset.shareType, button.dataset.shareId);
    } else if (action === 'add-comment') {
      var postIdVal = button.dataset.postId;
      closeDetail();
      openOperation('comment', { postId: postIdVal });
    } else if (action === 'add-poll-answer') {
      var answerPollId = button.dataset.pollId;
      closeDetail();
      openOperation('add-poll-answer', { pollId: answerPollId });
    } else if (action === 'vote') {
      var poll = polls.find(function (p) { return pollId(p) === button.dataset.pollId; });
      if (!poll) return;
      var pollPayload = { pollId: pollId(poll), poll: poll };
      closeDetail();
      openOperation('vote', pollPayload);
    }
  });

  document.getElementById('detailClose').addEventListener('click', closeDetail);

  // ---------- filters / sort controls --------------------------------

  function activateGroup(selector, activeButton) {
    var buttons = document.querySelectorAll(selector);
    for (var i = 0; i < buttons.length; i++) {
      var active = buttons[i] === activeButton;
      buttons[i].classList.toggle('active', active);
      buttons[i].setAttribute('aria-pressed', active ? 'true' : 'false');
    }
  }

  document.querySelectorAll('[data-filter-type]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      filter.type = btn.dataset.filterType;
      activateGroup('[data-filter-type]', btn);
      renderEntries();
    });
  });

  document.querySelectorAll('[data-sort-field]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      sort.field = btn.dataset.sortField;
      activateGroup('[data-sort-field]', btn);
      renderEntries();
    });
  });

  document.querySelectorAll('[data-sort-dir]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      sort.dir = btn.dataset.sortDir;
      activateGroup('[data-sort-dir]', btn);
      renderEntries();
    });
  });

  var tagFilterEl = document.getElementById('tagFilter');
  if (tagFilterEl) {
    tagFilterEl.addEventListener('click', function (event) {
      var chip = event.target.closest('[data-tag]');
      if (!chip) return;
      var tag = chip.dataset.tag.toLowerCase();
      var idx = filter.tags.indexOf(tag);
      if (idx === -1) filter.tags.push(tag);
      else filter.tags.splice(idx, 1);
      renderEntries();
    });
  }

  var tagFilterToggle = document.getElementById('tagFilterToggle');
  if (tagFilterToggle) {
    tagFilterToggle.addEventListener('click', function () {
      tagFiltersOpen = !tagFiltersOpen;
      renderTagFilterChips();
    });
  }

  var activeTagFilters = document.getElementById('activeTagFilters');
  if (activeTagFilters) {
    activeTagFilters.addEventListener('click', function (event) {
      var chip = event.target.closest('[data-remove-tag]');
      if (!chip) return;
      var index = filter.tags.indexOf(chip.dataset.removeTag);
      if (index !== -1) filter.tags.splice(index, 1);
      renderEntries();
    });
  }

  var tagFilterClear = document.getElementById('tagFilterClear');
  if (tagFilterClear) {
    tagFilterClear.addEventListener('click', function () {
      filter.tags = [];
      renderEntries();
    });
  }

  // ---------- operation dialog ----------------------------------------

  function updateSubmitLabel() {
    if (!pendingOperation) return;
    if (!auth.isQrMode()) { submitButton.textContent = pendingOperation.submitLabel; return; }
    var verbs = {
      'create-post': 'publish the post',
      comment: 'add the comment',
      'create-poll': 'publish the poll',
      'add-poll-answer': 'add an answer',
      vote: 'submit the vote'
    };
    submitButton.textContent = isEnglish
      ? 'Scan QR code to ' + verbs[pendingOperation.type]
      : 'Zeskanuj kod QR i ' + pendingOperation.verb;
  }

  function setScanning(scanning) {
    operationFields.querySelectorAll('input,textarea,select').forEach(function (field) {
      field.disabled = scanning;
    });
    submitButton.disabled = scanning;
    if (scanning) submitButton.textContent = 'Przyłóż paszport do kamery…';
    else updateSubmitLabel();
  }

  function openOperation(type, payload) {
    payload = payload || {};
    pendingOperation = {type: type, payload: payload, verb: '', submitLabel: ''};
    var fields = '';

    if (type === 'create-post') {
      pendingOperation.verb = 'opublikuj post';
      pendingOperation.submitLabel = 'Opublikuj post';
      dialogTitle.textContent = 'Nowy post';
      fields =
        '<div class="field"><label for="postTitle">Tytuł</label><input id="postTitle" maxlength="200" required></div>' +
        '<div class="field"><label for="postContent">Treść</label><textarea id="postContent" required maxlength="10000"></textarea></div>' +
        '<div class="field"><label for="postTags">Tagi (rozdzielone przecinkiem)</label><input id="postTags" maxlength="1000"></div>';
    } else if (type === 'comment') {
      pendingOperation.verb = 'dodaj komentarz';
      pendingOperation.submitLabel = 'Dodaj komentarz';
      dialogTitle.textContent = 'Nowy komentarz';
      fields = '<div class="field"><label for="commentContent">Treść komentarza</label><textarea id="commentContent" maxlength="5000" required></textarea></div>';
    } else if (type === 'create-poll') {
      pendingOperation.verb = 'opublikuj ankietę';
      pendingOperation.submitLabel = 'Opublikuj ankietę';
      dialogTitle.textContent = 'Nowa ankieta';
      fields =
        '<div class="field"><label for="pollType">Typ ankiety</label><select id="pollType"><option value="single_closed">Jednokrotnego wyboru — zamknięta</option><option value="single_open">Jednokrotnego wyboru — otwarta</option><option value="multiple_closed">Wielokrotnego wyboru — zamknięta</option><option value="multiple_open">Wielokrotnego wyboru — otwarta</option></select></div>' +
        '<div class="field"><label for="pollWeighted">Sposób liczenia głosów</label><select id="pollWeighted"><option value="false">Bez wagi</option><option value="true">Ważone RCR</option></select></div>' +
        '<div class="field"><label for="pollDays">Czas głosowania (dni, 1–60)</label><input id="pollDays" type="number" min="1" max="60" value="7" required></div>' +
        '<div class="field"><label for="pollTitle">Tytuł ankiety</label><input id="pollTitle" maxlength="200" required></div>' +
        '<div class="field"><label for="pollQuestion">Treść pytania</label><textarea id="pollQuestion" maxlength="5000" required></textarea></div>' +
        '<div class="field"><label for="pollAnswers">Odpowiedzi (każda w osobnym wierszu)</label><textarea class="options-input" id="pollAnswers"></textarea><p class="meta" id="pollAnswersHint"></p></div>' +
        '<div class="field"><label for="pollTags">Tagi (rozdzielone przecinkiem)</label><input id="pollTags" maxlength="1000"></div>';
    } else if (type === 'add-poll-answer') {
      pendingOperation.verb = 'dodaj odpowiedź';
      pendingOperation.submitLabel = 'Dodaj odpowiedź';
      dialogTitle.textContent = 'Dodaj odpowiedź do ankiety';
      fields = '<div class="field"><label for="pollAnswer">Nowa odpowiedź</label><input id="pollAnswer" maxlength="200" required></div>' +
        '<p class="meta">Dodanie odpowiedzi nie oddaje głosu.</p>';
    } else if (type === 'vote') {
      pendingOperation.verb = 'zapisz głos';
      pendingOperation.submitLabel = 'Zapisz głos';
      var poll = payload.poll;
      var choices = pollAnswers(poll);
      dialogTitle.textContent = 'Głosuj: ' + cellText(poll, ['TYTUŁ', 'TYTUL']);
      var inputType = isMultipleChoicePoll(poll) ? 'checkbox' : 'radio';
      fields = '<p>' + esc(cellText(poll, ['PYTANIE'])) + '</p>' +
        (String(cellText(poll, ['SPOSÓB_LICZENIA'])).toUpperCase() === 'RCR'
          ? '<p class="meta">Każda zaznaczona odpowiedź otrzyma pełną wagę Twojego salda RCR.</p>' : '') +
        '<div class="poll-options">' + choices.map(function (choice, index) {
          return '<label class="poll-option"><input type="' + inputType + '" name="pollChoice" value="' +
            esc(choice) + '" id="choice' + index + '"> ' + esc(choice) + '</label>';
        }).join('') + '</div>';
    }

    operationFields.innerHTML = fields;
    if (type === 'create-poll') {
      var pollType = document.getElementById('pollType');
      var pollAnswersField = document.getElementById('pollAnswers');
      var pollAnswersHint = document.getElementById('pollAnswersHint');
      var updatePollAnswersHint = function () {
        var openPoll = /_open$/.test(pollType.value);
        pollAnswersField.required = !openPoll;
        pollAnswersHint.textContent = openPoll
          ? 'Opcjonalne dla ankiety otwartej; użytkownicy mogą dodawać odpowiedzi później (maks. 20).'
          : 'Wymagane: od 2 do 20 odpowiedzi.';
      };
      pollType.addEventListener('change', updatePollAnswersHint);
      updatePollAnswersHint();
    }
    document.getElementById('boardLogin').value = '';
    document.getElementById('boardPin').value = '';
    dialogMessage.textContent = '';
    dialogMessage.className = 'dialog-message';
    submitButton.disabled = false;
    auth.reset();
    updateSubmitLabel();
    scrim.classList.add('open');
    boardDialog.classList.add('open');
    boardDialog.removeAttribute('inert');
    boardDialog.setAttribute('aria-hidden', 'false');
    if (window.KBKDialog) {
      var initialField = operationFields.querySelector('input,textarea,select');
      closeDialogFocus = window.KBKDialog.open(boardDialog, {
        initialFocus: initialField ? '#' + initialField.id : '#boardLogin',
        onEscape: closeDialog
      });
    } else {
      (initialField || document.getElementById('boardLogin')).focus();
    }
  }

  function buildPayload() {
    var payload = {};
    ['postId', 'commentId', 'pollId'].forEach(function (key) {
      if (pendingOperation.payload[key]) payload[key] = pendingOperation.payload[key];
    });
    if (pendingOperation.type === 'create-post') {
      payload.title = document.getElementById('postTitle').value.trim();
      payload.content = document.getElementById('postContent').value.trim();
      payload.tags = document.getElementById('postTags').value.trim();
      if (!payload.title || !payload.content) throw new Error('Tytuł i treść posta są wymagane.');
    } else if (pendingOperation.type === 'comment') {
      payload.content = document.getElementById('commentContent').value.trim();
      if (!payload.content) throw new Error('Treść komentarza jest wymagana.');
    } else if (pendingOperation.type === 'create-poll') {
      payload.type = document.getElementById('pollType').value;
      payload.weighted = document.getElementById('pollWeighted').value === 'true';
      payload.days = Number(document.getElementById('pollDays').value);
      payload.title = document.getElementById('pollTitle').value.trim();
      payload.question = document.getElementById('pollQuestion').value.trim();
      payload.answers = document.getElementById('pollAnswers').value
        .split(/\r?\n/).map(function (a) { return a.trim(); }).filter(Boolean);
      payload.tags = document.getElementById('pollTags').value.trim();
      if (!Number.isInteger(payload.days) || payload.days < 1 || payload.days > 60) {
        throw new Error('Czas głosowania musi wynosić od 1 do 60 dni.');
      }
      if (!payload.title || !payload.question) throw new Error('Tytuł i treść pytania są wymagane.');
      var openPoll = /_open$/.test(payload.type);
      if ((!openPoll && payload.answers.length < 2) || payload.answers.length > 20) {
        throw new Error(openPoll
          ? 'Ankieta otwarta może mieć maksymalnie 20 odpowiedzi.'
          : 'Ankieta zamknięta musi mieć od 2 do 20 odpowiedzi.');
      }
      if (new Set(payload.answers.map(function (answer) { return answer.toLowerCase(); })).size !==
          payload.answers.length) {
        throw new Error('Odpowiedzi nie mogą się powtarzać.');
      }
    } else if (pendingOperation.type === 'add-poll-answer') {
      payload.answer = document.getElementById('pollAnswer').value.trim();
      if (!payload.answer) throw new Error('Treść odpowiedzi jest wymagana.');
    } else if (pendingOperation.type === 'vote') {
      payload.answers = Array.from(
        operationFields.querySelectorAll('input[name="pollChoice"]:checked')
      ).map(function (i) { return i.value; });
      if (!payload.answers.length) throw new Error('Wybierz co najmniej jedną odpowiedź.');
      if (!isMultipleChoicePoll(pendingOperation.payload.poll) && payload.answers.length !== 1) {
        throw new Error('Wybierz jedną odpowiedź.');
      }
    }
    return payload;
  }

  function showDialogMessage(message, type) {
    dialogMessage.textContent = message || '';
    dialogMessage.className = 'dialog-message' + (type ? ' ' + type : '');
  }

  function submitPending(qrHash) {
    if (!pendingOperation) return;
    var payload;
    try { payload = buildPayload(); }
    catch (error) { showDialogMessage(error.message, 'error'); return; }
    var credentials = qrHash ? {qrHash: qrHash} : auth.credentials();
    if (!credentials || (!credentials.qrHash &&
        (!credentials.login || !/^\d{6}$/.test(credentials.pin)))) {
      showDialogMessage('Wybierz metodę uwierzytelnienia i podaj wymagane dane.', 'error');
      return;
    }
    executeOperation(payload, credentials);
  }

  function apiAction(operation, credentials) {
    var actionByType = {
      'create-post': 'createBoardPost',
      comment: 'addBoardComment',
      'create-poll': 'createBoardPoll',
      'add-poll-answer': 'addBoardPollAnswer',
      vote: 'castBoardVote'
    };
    return fetch(config.webAppUrl, {
      method: 'POST',
      headers: {'Content-Type': 'text/plain;charset=utf-8'},
      body: JSON.stringify(Object.assign(
        {action: actionByType[operation.type]}, operation.payload, credentials
      ))
    }).then(function (response) {
      if (!response.ok) throw new Error('Nieoczekiwany status odpowiedzi: ' + response.status);
      return response.json();
    });
  }

  function executeOperation(payload, credentials) {
    var operation = {type: pendingOperation.type, payload: payload};
    submitButton.disabled = true;
    closeButton.disabled = true;
    cancelButton.disabled = true;
    auth.setDisabled(true);
    operationFields.querySelectorAll('input,textarea,select').forEach(function (field) {
      field.disabled = true;
    });
    showDialogMessage('Zapisywanie…');
    apiAction(operation, credentials).then(function (data) {
      if (data && data.ok) {
        showDialogMessage(data.message || 'Zapisano.', 'ok');
        var reopen = null;
        if (operation.type === 'comment') {
          reopen = { type: 'post', id: payload.postId };
        } else if (operation.type === 'vote') {
          reopen = { type: 'poll', id: payload.pollId };
        } else if (operation.type === 'add-poll-answer') {
          reopen = { type: 'poll', id: payload.pollId };
        }
        setTimeout(function () {
          closeDialog();
          loadBoard().then(function () {
            if (reopen) {
              var entry = findEntry(reopen.type, reopen.id);
              if (entry) openDetail(entry);
            }
          });
        }, 250);
        return;
      }
      if (data && data.error === 'account_locked' && credentials.login) {
        closeDialog();
        pinReset.open(credentials.login);
        return;
      }
      showDialogMessage(
        data && data.message ? data.message : 'Nie udało się zapisać. Spróbuj ponownie.',
        'error'
      );
    }).catch(function (error) {
      console.error('Nie udało się ustalić wyniku operacji na Tablicy.', error);
      showDialogMessage(
        'Nie znamy wyniku zapisu. Odśwież Tablicę i sprawdź, czy wpis już się pojawił, zanim wyślesz go ponownie.',
        'error'
      );
    }).finally(function () {
      submitButton.disabled = false;
      closeButton.disabled = false;
      cancelButton.disabled = false;
      auth.setDisabled(false);
      operationFields.querySelectorAll('input,textarea,select').forEach(function (field) {
        field.disabled = false;
      });
      updateSubmitLabel();
    });
  }

  submitButton.addEventListener('click', function () {
    try { buildPayload(); }
    catch (error) { showDialogMessage(error.message, 'error'); return; }
    if (auth.isQrMode()) { auth.startScan(); return; }
    submitPending('');
  });

  document.getElementById('newPost').addEventListener('click', function () { openOperation('create-post'); });
  document.getElementById('newPoll').addEventListener('click', function () { openOperation('create-poll'); });
  document.getElementById('dialogClose').addEventListener('click', closeDialog);
  document.getElementById('dialogCancel').addEventListener('click', closeDialog);
  scrim.addEventListener('click', function () {
    if (boardDetail.classList.contains('open')) closeDetail();
    else if (boardDialog.classList.contains('open')) closeDialog();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (window.KBKDialog) return;
    if (boardDetail.classList.contains('open')) closeDetail();
    else if (boardDialog.classList.contains('open')) closeDialog();
  });

  loadBoard().then(openLinkedEntry);
})();