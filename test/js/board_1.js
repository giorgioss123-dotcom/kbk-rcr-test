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
  var expandedPostId = '';
  var pendingOperation = null;

  var filter = { type: 'all', tags: [] };
  var sort = { field: 'activity', dir: 'desc' };

  var boardView = document.getElementById('boardEntries');
  var notice = document.getElementById('boardNotice');
  var scrim = document.getElementById('boardScrim');
  var dialog = document.getElementById('boardDialog');
  var dialogTitle = document.getElementById('dialogTitle');
  var operationFields = document.getElementById('operationFields');
  var dialogMessage = document.getElementById('dialogMessage');
  var submitButton = document.getElementById('dialogSubmit');
  var closeButton = document.getElementById('dialogClose');
  var cancelButton = document.getElementById('dialogCancel');
  var closeDialogFocus = null;

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
    var cell = shared.lookupCell(row, names);
    return shared.strFromCell(cell);
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
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  }

  function tagsHtml(value) {
    return String(value || '').split(',').map(function (tag) { return tag.trim(); }).filter(Boolean)
      .map(function (tag) { return '<span class="tag">#' + esc(tag.replace(/^#+/, '')) + '</span>'; }).join('');
  }

  function parseTags(value) {
    return String(value || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean);
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
      cacheMs: 0,
      timeoutMs: 15000,
      forceReload: true
    }).then(function (table) {
      return shared.tableToObjects(table);
    });
  }

  function loadBoard() {
    setNotice('Wczytywanie Tablicy…');
    return Promise.all([
      getRows('Posty'),
      getRows('Komentarze'),
      getRows('Ankiety'),
      getRows('Głosy')
    ]).then(function (tables) {
      posts = tables[0];
      comments = tables[1];
      polls = tables[2];
      votes = tables[3];
      renderEntries();
      setNotice('');
    }).catch(function (error) {
      console.error('Nie udało się wczytać Tablicy.', error);
      setNotice(error.message || 'Nie udało się wczytać Tablicy.', 'error');
      boardView.innerHTML = '<div class="empty">Nie udało się wczytać wpisów.</div>';
    });
  }

  function postId(row) { return cellText(row, ['ID_POSTA', 'ID posta']); }
  function commentId(row) { return cellText(row, ['ID_KOMENTARZA', 'ID komentarza']); }
  function pollId(row) { return cellText(row, ['ID_ANKIETY', 'ID ankiety']); }
  function loginOf(row) { return cellText(row, ['LOGIN_AUTORA', 'LOGIN', 'NAZWA_UŻYTKOWNIKA']); }

  function pollAnswers(poll) {
    try {
      var parsed = JSON.parse(cellText(poll, ['ODPOWIEDZI_JSON', 'ODPOWIEDZI']) || '[]');
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch (error) {
      console.error('Nieprawidłowy format odpowiedzi ankiety.', error);
      return [];
    }
  }

  function pollVotes(id) {
    return votes.filter(function (vote) { return cellText(vote, ['ID_ANKIETY']) === id; });
  }

  function formatNumber(value) {
    return new Intl.NumberFormat(isEnglish ? 'en-US' : 'pl-PL', {maximumFractionDigits: 2}).format(value);
  }

  function voteCountLabel(count) {
    if (isEnglish) return count === 1 ? 'vote' : 'votes';
    if (count === 1) return 'głos';
    var lastTwo = count % 100;
    var lastDigit = count % 10;
    return lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14) ? 'głosy' : 'głosów';
  }

  // --- Metadata helpers ------------------------------------------------

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
    var closeDate = dateValue(cellValue(poll, ['DATA_ZAMKNIĘCIA', 'DATA_ZAMKNIECIA']));
    var t = closeDate.getTime();
    return t > 0 && t <= Date.now();
  }

  // --- Entry aggregation, filter, sort --------------------------------

  function getAllEntries() {
    var all = [];
    posts.forEach(function (post) {
      all.push({
        type: 'post', row: post, id: postId(post),
        tags: parseTags(cellText(post, ['TAGI'])),
        createdAt: dateValue(cellValue(post, ['DATA_UTWORZENIA'])).getTime(),
        activityAt: postActivity(post)
      });
    });
    polls.forEach(function (poll) {
      all.push({
        type: 'poll', row: poll, id: pollId(poll),
        tags: parseTags(cellText(poll, ['TAGI'])),
        createdAt: dateValue(cellValue(poll, ['DATA_UTWORZENIA'])).getTime(),
        activityAt: pollActivity(poll)
      });
    });
    return all;
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
    var av = sort.field === 'created' ? a.createdAt : a.activityAt;
    var bv = sort.field === 'created' ? b.createdAt : b.activityAt;
    return sort.dir === 'asc' ? av - bv : bv - av;
  }

  // --- Rendering -------------------------------------------------------

  function renderEntries() {
    renderTagFilterChips();
    var visible = getAllEntries().filter(entryMatchesFilter).sort(compareEntries);
    if (!visible.length) {
      boardView.innerHTML = '<div class="empty">' +
        (isEnglish ? 'No entries match the criteria.' : 'Brak wpisów spełniających kryteria.') +
        '</div>';
      return;
    }
    boardView.innerHTML = visible.map(function (e) {
      return e.type === 'post' ? renderPostEntry(e.row) : renderPollEntry(e.row);
    }).join('');
  }

  function renderTagFilterChips() {
    var tagFilterEl = document.getElementById('tagFilter');
    var tagFilterRow = document.getElementById('tagFilterRow');
    if (!tagFilterEl) return;
    var seen = {};
    var tags = [];
    getAllEntries().forEach(function (e) {
      e.tags.forEach(function (tag) {
        var key = tag.toLowerCase();
        if (!seen[key]) { seen[key] = tag; tags.push(tag); }
      });
    });
    tags.sort(function (a, b) { return a.localeCompare(b, 'pl'); });
    if (tagFilterRow) tagFilterRow.hidden = tags.length === 0;
    tagFilterEl.innerHTML = tags.map(function (tag) {
      var active = filter.tags.some(function (t) { return t === tag.toLowerCase(); });
      return '<button type="button" class="tag-chip' + (active ? ' active' : '') +
        '" data-tag="' + esc(tag) + '" aria-pressed="' + (active ? 'true' : 'false') + '">#' +
        esc(tag) + '</button>';
    }).join('');
  }

  function renderPostEntry(post) {
    var id = postId(post);
    var title = cellText(post, ['TYTUŁ', 'TYTUL']);
    var content = cellText(post, ['TREŚĆ', 'TRESC']);
    var author = loginOf(post);
    var commentsForPost = comments.filter(function (comment) { return cellText(comment, ['ID_POSTA']) === id; })
      .sort(function (a, b) {
        return dateValue(cellValue(a, ['DATA_DODANIA'])).getTime() -
               dateValue(cellValue(b, ['DATA_DODANIA'])).getTime();
      });
    var commentMarkup = commentsForPost.map(function (comment) {
      return '<div class="comment"><div class="meta">' + esc(loginOf(comment)) + ' · ' +
        esc(dateLabel(cellValue(comment, ['DATA_DODANIA']))) +
        (dateValue(cellValue(comment, ['OSTATNIA_AKTYWNOŚĆ'])).getTime() >
         dateValue(cellValue(comment, ['DATA_DODANIA'])).getTime()
          ? ' · <span>edytowano</span> ' +
            esc(dateLabel(cellValue(comment, ['OSTATNIA_AKTYWNOŚĆ']))) : '') + '</div>' +
        '<p>' + esc(cellText(comment, ['TREŚĆ', 'TRESC'])) + '</p>' +
        '<div class="entry-actions"><button type="button" data-action="edit-comment" data-comment-id="' +
        esc(commentId(comment)) + '">Edytuj komentarz</button></div></div>';
    }).join('');
    var expanded = expandedPostId === id;
    return '<article class="entry" data-entry-type="post" data-post-id="' + esc(id) + '">' +
      '<div class="entry-head"><div><h2>' + esc(title) + '</h2><div class="meta">' +
      esc(author) + ' · <span>opublikowano</span> ' +
      esc(dateLabel(cellValue(post, ['DATA_UTWORZENIA']))) +
      (dateValue(cellValue(post, ['OSTATNIA_AKTYWNOŚĆ'])).getTime() >
       dateValue(cellValue(post, ['DATA_UTWORZENIA'])).getTime()
        ? ' · <span>edytowano</span> ' +
          esc(dateLabel(cellValue(post, ['OSTATNIA_AKTYWNOŚĆ']))) : '') +
      '</div></div><button type="button" class="comment-toggle" data-action="toggle-comments" ' +
      'data-post-id="' + esc(id) + '">' +
      (expanded ? '<span>Ukryj komentarze</span>'
                : '<span>Komentarze</span> (' + commentsForPost.length + ')') +
      '</button></div>' +
      '<div class="entry-content">' + esc(content) + '</div>' +
      '<div class="tags">' + tagsHtml(cellText(post, ['TAGI'])) + '</div>' +
      '<div class="entry-actions"><button type="button" data-action="edit-post" data-post-id="' +
      esc(id) + '">Edytuj post</button></div>' +
      '<div class="comments" ' + (expanded ? '' : 'hidden') + '><h3>Komentarze</h3>' +
      (commentMarkup || '<p class="meta">Brak komentarzy.</p>') +
      '<div class="entry-actions"><button type="button" data-action="add-comment" data-post-id="' +
      esc(id) + '">Dodaj komentarz</button></div></div></article>';
  }

  function renderPollEntry(poll) {
    var id = pollId(poll);
    var answers = pollAnswers(poll);
    var ballotRows = pollVotes(id);
    var weighted = String(cellText(poll, ['SPOSÓB_LICZENIA', 'SPOSOB_LICZENIA'])).toUpperCase() === 'RCR';
    var closed = isPollClosed(poll);
    var closeCell = cellValue(poll, ['DATA_ZAMKNIĘCIA', 'DATA_ZAMKNIECIA']);
    var hasCloseDate = dateValue(closeCell).getTime() > 0;

    var stats = answers.map(function (answer) {
      var selected = ballotRows.filter(function (vote) {
        return cellText(vote, ['ODPOWIEDŹ', 'ODPOWIEDZ']) === answer;
      });
      var weight = selected.reduce(function (sum, vote) {
        return sum + Number(cellValue(vote, ['WAGA_RCR']) || 0);
      }, 0);
      return { answer: answer, rows: selected, count: selected.length, weight: weight };
    });
    var totalPrimary = stats.reduce(function (sum, stat) {
      return sum + (weighted ? stat.weight : stat.count);
    }, 0);
    var statMarkup = stats.map(function (stat) {
      var primary = weighted ? stat.weight : stat.count;
      var percent = totalPrimary > 0 ? primary / totalPrimary * 100 : 0;
      var voters = stat.rows.map(function (vote) { return cellText(vote, ['LOGIN']); })
        .filter(Boolean).join(', ');
      return '<div class="poll-option"><div class="poll-option-head"><span>' + esc(stat.answer) +
        '</span><span>' +
        (weighted ? esc(formatNumber(primary)) + ' RCR'
                  : esc(String(stat.count)) + ' <span>' + voteCountLabel(stat.count) + '</span>') +
        '</span></div>' +
        '<div class="poll-bar"><span style="width:' +
        Math.max(0, Math.min(100, percent)) + '%"></span></div>' +
        '<div class="meta"><span>Suma siły głosu:</span> ' + esc(formatNumber(stat.weight)) +
        ' RCR · ' + esc(stat.count) + ' <span>' + voteCountLabel(stat.count) + '</span></div>' +
        '<div class="voter-list"><span>Głosujący:</span> ' + esc(voters || '—') + '</div></div>';
    }).join('');

    var termText = hasCloseDate
      ? (closed ? ' · <span>zakończona</span> ' + esc(dateLabel(closeCell))
                : ' · <span>Termin:</span> ' + esc(dateLabel(closeCell)))
      : '';
    var badge = closed ? '<span class="entry-badge closed">zakończona</span>' : '';

    return '<article class="entry entry-poll' + (closed ? ' entry-closed' : '') +
      '" data-entry-type="poll" data-poll-id="' + esc(id) + '">' +
      '<div class="entry-head"><div><h2>' + esc(cellText(poll, ['TYTUŁ', 'TYTUL'])) + '</h2>' +
      '<div class="meta">' + esc(loginOf(poll)) + ' · <span>opublikowano</span> ' +
      esc(dateLabel(cellValue(poll, ['DATA_UTWORZENIA']))) + termText + '</div></div>' +
      badge + '</div>' +
      '<div class="entry-content">' + esc(cellText(poll, ['PYTANIE'])) + '</div>' +
      '<div class="meta"><span>' +
      (cellText(poll, ['TYP']) === 'multiple' ? 'Wielokrotny wybór' : 'Jednokrotny wybór') +
      '</span> · <span>' + (weighted ? 'Głosy ważone RCR' : 'Głosy bez wagi') + '</span></div>' +
      '<div class="tags">' + tagsHtml(cellText(poll, ['TAGI'])) + '</div>' +
      '<div class="poll-options">' + statMarkup + '</div>' +
      (!closed ? '<div class="entry-actions"><button type="button" data-action="vote" data-poll-id="' +
        esc(id) + '">Oddaj / zmień głos</button></div>' : '') +
      '</article>';
  }

  // --- Event delegation for entries ----------------------------------

  boardView.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-action]');
    if (!button) return;
    var action = button.dataset.action;
    if (action === 'toggle-comments') {
      expandedPostId = expandedPostId === button.dataset.postId ? '' : button.dataset.postId;
      renderEntries();
    } else if (action === 'add-comment') {
      openOperation('comment', {postId: button.dataset.postId});
    } else if (action === 'edit-post') {
      var post = posts.find(function (item) { return postId(item) === button.dataset.postId; });
      if (post) openOperation('edit-post', {postId: postId(post), post: post});
    } else if (action === 'edit-comment') {
      var comment = comments.find(function (item) { return commentId(item) === button.dataset.commentId; });
      if (comment) {
        openOperation('edit-comment', {
          commentId: commentId(comment),
          postId: cellText(comment, ['ID_POSTA']),
          comment: comment
        });
      }
    } else if (action === 'vote') {
      var poll = polls.find(function (item) { return pollId(item) === button.dataset.pollId; });
      if (poll) openOperation('vote', {pollId: pollId(poll), poll: poll});
    }
  });

  // --- Filter & sort controls -----------------------------------------

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

  // --- Dialog / operations (bez zmian względem oryginału) -------------

  function updateSubmitLabel() {
    if (!pendingOperation) return;
    if (!auth.isQrMode()) { submitButton.textContent = pendingOperation.submitLabel; return; }
    var englishVerbs = {
      'create-post': 'publish the post',
      'edit-post': 'save the changes',
      comment: 'add the comment',
      'edit-comment': 'save the comment',
      'create-poll': 'publish the poll',
      vote: 'submit the vote'
    };
    submitButton.textContent = isEnglish
      ? 'Scan QR code to ' + englishVerbs[pendingOperation.type]
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
    if (type === 'create-post' || type === 'edit-post') {
      pendingOperation.verb = type === 'edit-post' ? 'zapisz zmiany' : 'opublikuj post';
      pendingOperation.submitLabel = type === 'edit-post' ? 'Zapisz zmiany' : 'Opublikuj post';
      var existingPost = payload.post || {};
      dialogTitle.textContent = type === 'edit-post' ? 'Edytuj post' : 'Nowy post';
      fields = '<div class="field"><label for="postTitle">Tytuł</label><input id="postTitle" maxlength="200" required value="' + esc(cellText(existingPost, ['TYTUŁ', 'TYTUL'])) + '"></div>' +
        '<div class="field"><label for="postContent">Treść</label><textarea id="postContent" required maxlength="10000">' + esc(cellText(existingPost, ['TREŚĆ', 'TRESC'])) + '</textarea></div>' +
        '<div class="field"><label for="postTags">Tagi (rozdzielone przecinkiem)</label><input id="postTags" maxlength="1000" value="' + esc(cellText(existingPost, ['TAGI'])) + '"></div>';
    } else if (type === 'comment' || type === 'edit-comment') {
      pendingOperation.verb = type === 'edit-comment' ? 'zapisz komentarz' : 'dodaj komentarz';
      pendingOperation.submitLabel = type === 'edit-comment' ? 'Zapisz komentarz' : 'Dodaj komentarz';
      var existingComment = payload.comment || {};
      dialogTitle.textContent = type === 'edit-comment' ? 'Edytuj komentarz' : 'Nowy komentarz';
      fields = '<div class="field"><label for="commentContent">Treść komentarza</label><textarea id="commentContent" maxlength="5000" required>' +
        esc(cellText(existingComment, ['TREŚĆ', 'TRESC'])) + '</textarea></div>';
    } else if (type === 'create-poll') {
      pendingOperation.verb = 'opublikuj ankietę';
      pendingOperation.submitLabel = 'Opublikuj ankietę';
      dialogTitle.textContent = 'Nowa ankieta';
      fields = '<div class="field"><label for="pollType">Typ ankiety</label><select id="pollType"><option value="single">Jednokrotnego wyboru</option><option value="multiple">Wielokrotnego wyboru</option></select></div>' +
        '<div class="field"><label for="pollWeighted">Sposób liczenia głosów</label><select id="pollWeighted"><option value="false">Bez wagi</option><option value="true">Ważone RCR</option></select></div>' +
        '<div class="field"><label for="pollDays">Czas głosowania (dni, 1–60)</label><input id="pollDays" type="number" min="1" max="60" value="7" required></div>' +
        '<div class="field"><label for="pollTitle">Tytuł ankiety</label><input id="pollTitle" maxlength="200" required></div>' +
        '<div class="field"><label for="pollQuestion">Treść pytania</label><textarea id="pollQuestion" maxlength="5000" required></textarea></div>' +
        '<div class="field"><label for="pollAnswers">Odpowiedzi (każda w osobnym wierszu, 2–20)</label><textarea class="options-input" id="pollAnswers" required></textarea></div>' +
        '<div class="field"><label for="pollTags">Tagi (rozdzielone przecinkiem)</label><input id="pollTags" maxlength="1000"></div>';
    } else if (type === 'vote') {
      pendingOperation.verb = 'zapisz głos';
      pendingOperation.submitLabel = 'Zapisz głos';
      var poll = payload.poll;
      var choices = pollAnswers(poll);
      dialogTitle.textContent = 'Głosuj: ' + cellText(poll, ['TYTUŁ', 'TYTUL']);
      var inputType = cellText(poll, ['TYP']) === 'multiple' ? 'checkbox' : 'radio';
      fields = '<p>' + esc(cellText(poll, ['PYTANIE'])) + '</p>' +
        (String(cellText(poll, ['SPOSÓB_LICZENIA'])).toUpperCase() === 'RCR'
          ? '<p class="meta">Każda zaznaczona odpowiedź otrzyma pełną wagę Twojego salda RCR.</p>' : '') +
        '<div class="poll-options">' + choices.map(function (choice, index) {
          return '<label class="poll-option"><input type="' + inputType + '" name="pollChoice" value="' +
            esc(choice) + '" id="choice' + index + '"> ' + esc(choice) + '</label>';
        }).join('') + '</div>';
    }
    operationFields.innerHTML = fields;
    document.getElementById('boardLogin').value = '';
    document.getElementById('boardPin').value = '';
    dialogMessage.textContent = '';
    dialogMessage.className = 'dialog-message';
    submitButton.disabled = false;
    auth.reset();
    updateSubmitLabel();
    scrim.classList.add('open');
    dialog.classList.add('open');
    dialog.removeAttribute('inert');
    dialog.setAttribute('aria-hidden', 'false');
    if (window.KBKDialog) {
      var initialField = operationFields.querySelector('input,textarea,select');
      closeDialogFocus = window.KBKDialog.open(dialog, {
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
    if (pendingOperation.type === 'create-post' || pendingOperation.type === 'edit-post') {
      payload.title = document.getElementById('postTitle').value.trim();
      payload.content = document.getElementById('postContent').value.trim();
      payload.tags = document.getElementById('postTags').value.trim();
      if (!payload.title || !payload.content) throw new Error('Tytuł i treść posta są wymagane.');
    } else if (pendingOperation.type === 'comment' || pendingOperation.type === 'edit-comment') {
      payload.content = document.getElementById('commentContent').value.trim();
      if (!payload.content) throw new Error('Treść komentarza jest wymagana.');
    } else if (pendingOperation.type === 'create-poll') {
      payload.type = document.getElementById('pollType').value;
      payload.weighted = document.getElementById('pollWeighted').value === 'true';
      payload.days = Number(document.getElementById('pollDays').value);
      payload.title = document.getElementById('pollTitle').value.trim();
      payload.question = document.getElementById('pollQuestion').value.trim();
      payload.answers = document.getElementById('pollAnswers').value
        .split(/\r?\n/).map(function (answer) { return answer.trim(); }).filter(Boolean);
      payload.tags = document.getElementById('pollTags').value.trim();
      if (!Number.isInteger(payload.days) || payload.days < 1 || payload.days > 60) {
        throw new Error('Czas głosowania musi wynosić od 1 do 60 dni.');
      }
      if (!payload.title || !payload.question) throw new Error('Tytuł i treść pytania są wymagane.');
      if (payload.answers.length < 2 || payload.answers.length > 20) {
        throw new Error('Ankieta musi mieć od 2 do 20 odpowiedzi.');
      }
      if (new Set(payload.answers).size !== payload.answers.length) {
        throw new Error('Odpowiedzi nie mogą się powtarzać.');
      }
    } else if (pendingOperation.type === 'vote') {
      payload.answers = Array.from(
        operationFields.querySelectorAll('input[name="pollChoice"]:checked')
      ).map(function (input) { return input.value; });
      if (!payload.answers.length) throw new Error('Wybierz co najmniej jedną odpowiedź.');
      if (cellText(pendingOperation.payload.poll, ['TYP']) !== 'multiple' && payload.answers.length !== 1) {
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
      'edit-post': 'editBoardPost',
      comment: 'addBoardComment',
      'edit-comment': 'editBoardComment',
      'create-poll': 'createBoardPoll',
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
        setTimeout(function () {
          closeDialog();
          if (operation.type === 'comment' || operation.type === 'edit-comment') {
            expandedPostId = payload.postId || '';
          }
          loadBoard();
        }, 250);
        return;
      }
      if (data && data.error === 'account_locked' && credentials.login) {
        closeDialog(); pinReset.open(credentials.login); return;
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

  function closeDialog() {
    scrim.classList.remove('open');
    dialog.classList.remove('open');
    if (closeDialogFocus) {
      closeDialogFocus(true);
      closeDialogFocus = null;
    } else {
      dialog.setAttribute('inert', '');
      dialog.setAttribute('aria-hidden', 'true');
    }
    auth.reset();
    pendingOperation = null;
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
  scrim.addEventListener('click', function (event) { if (event.target === scrim) closeDialog(); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && scrim.classList.contains('open') && !window.KBKDialog) closeDialog();
  });

  loadBoard();
})();