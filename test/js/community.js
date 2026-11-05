(function (window, document) {
  'use strict';

  var shared = window.KBKShared;
  var sheetIds = window.KBK_PUBLIC_SHEET_IDS || {};
  var recentActivityWindow = 3 * 24 * 60 * 60 * 1000;
  var status = document.getElementById('activityStatus');
  var menuToggle = document.getElementById('activityMenuToggle');
  var activityPopover = document.getElementById('activityPopover');
  var summaryCount = document.getElementById('activitySummaryCount');
  var summaryCounts = {};

  function setMenuOpen(open) {
    menuToggle.setAttribute('aria-expanded', String(open));
    activityPopover.hidden = !open;
  }

  menuToggle.addEventListener('click', function () {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('click', function (event) {
    if (!activityPopover.contains(event.target) && !menuToggle.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  function updateSummaryCount() {
    var categories = ['proposals', 'polls', 'posts'];
    if (categories.some(function (name) { return !Object.prototype.hasOwnProperty.call(summaryCounts, name); })) {
      summaryCount.textContent = '…';
      return;
    }
    if (categories.some(function (name) { return summaryCounts[name] === null; })) {
      summaryCount.textContent = '—';
      return;
    }
    summaryCount.textContent = String(categories.filter(function (name) {
      return summaryCounts[name] > 0;
    }).length);
  }

  function cell(row, names) {
    return shared.lookupCell(row, names);
  }

  function text(row, names) {
    return shared.strFromCell(cell(row, names));
  }

  function dateValue(value) {
    if (value && typeof value === 'object') {
      value = value.v !== undefined && value.v !== null ? value.v : value.f;
    }
    if (value instanceof Date) return value;
    var match = /^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)$/.exec(String(value || ''));
    if (match) {
      return new Date(Number(match[1]), Number(match[2]), Number(match[3]),
        Number(match[4] || 0), Number(match[5] || 0), Number(match[6] || 0));
    }
    var parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  function loadSheet(sheetId, sheetName) {
    if (!sheetId) return Promise.reject(new Error('Brak ID arkusza: ' + sheetName));
    return shared.loadSheetJSONP(sheetId, sheetName, {
      cacheMs: 60000,
      timeoutMs: 15000
    }).then(shared.tableToObjects);
  }

  function setCount(name, value, failed) {
    if (name === 'proposals' || name === 'polls' || name === 'posts') {
      summaryCounts[name] = failed ? null : value;
      updateSummaryCount();
    }

    document.querySelectorAll('[data-activity="' + name + '"]').forEach(function (element) {
      element.dataset.state = failed ? 'error' : 'ready';
      element.querySelector('.activity-value').textContent = failed ? '—' : String(value);
    });

    var module = document.querySelector('[data-module-count="' + name + '"]');
    if (module) {
      module.dataset.state = failed ? 'error' : 'ready';
      var values = Array.isArray(value) ? value : [value];
      module.querySelectorAll('strong').forEach(function (element, index) {
        element.textContent = failed ? '—' : String(values[index]);
      });
    }
  }

  function loadProposals() {
    return loadSheet(sheetIds.wnioskiFileId, 'WNIOSKI').then(function (rows) {
      return rows.filter(function (row) {
        return text(row, ['STATUS']).trim().toLowerCase() === 'aktywny';
      }).length;
    });
  }

  function loadBoardActivity() {
    return Promise.all([
      loadSheet(sheetIds.tablicaFileId, 'Posty'),
      loadSheet(sheetIds.tablicaFileId, 'Komentarze'),
      loadSheet(sheetIds.tablicaFileId, 'Ankiety')
    ]).then(function (tables) {
      var now = Date.now();
      var activityByPost = {};

      tables[1].forEach(function (comment) {
        var id = text(comment, ['ID_POSTA']);
        var date = dateValue(cell(comment, ['DATA_DODANIA']));
        if (id && date) {
          activityByPost[id] = Math.max(activityByPost[id] || 0, date.getTime());
        }
      });

      var activePolls = tables[2].filter(function (poll) {
        var closesAt = dateValue(cell(poll, ['DATA_ZAMKNIĘCIA', 'DATA_ZAMKNIECIA']));
        return closesAt && closesAt.getTime() > now;
      }).length;

      var recentPosts = tables[0].filter(function (post) {
        var id = text(post, ['ID_POSTA', 'ID posta']);
        var createdAt = dateValue(cell(post, ['DATA_UTWORZENIA']));
        var lastActivity = dateValue(cell(post, ['OSTATNIA_AKTYWNOŚĆ']));
        var activityAt = Math.max(
          createdAt ? createdAt.getTime() : 0,
          lastActivity ? lastActivity.getTime() : 0,
          activityByPost[id] || 0
        );
        return activityAt >= now - recentActivityWindow && activityAt <= now;
      }).length;

      return {polls: activePolls, posts: recentPosts};
    });
  }

  var results = [
    loadProposals().then(function (count) {
      setCount('proposals', count, false);
      return true;
    }, function (error) {
      console.error('Nie udało się wczytać liczby aktywnych wniosków.', error);
      setCount('proposals', null, true);
      return false;
    }),
    loadBoardActivity().then(function (counts) {
      setCount('polls', counts.polls, false);
      setCount('posts', counts.posts, false);
      setCount('board', [counts.polls, counts.posts], false);
      return true;
    }, function (error) {
      console.error('Nie udało się wczytać aktualności Tablicy.', error);
      setCount('polls', null, true);
      setCount('posts', null, true);
      setCount('board', null, true);
      return false;
    })
  ];

  Promise.all(results).then(function (loaded) {
    if (loaded.some(function (ok) { return !ok; })) {
      status.textContent = 'Nie udało się wczytać części aktualności. Spróbuj ponownie później.';
      status.classList.add('error');
    }
  });
})(window, document);
