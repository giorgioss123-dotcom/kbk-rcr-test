(function () {
  function safeText(value, fallback) {
    if (value === null || value === undefined) return fallback !== undefined ? fallback : '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    try {
      const text = String(value).trim();
      return text === 'undefined' || text === 'null' ? (fallback !== undefined ? fallback : '') : text;
    } catch (e) {
      return fallback !== undefined ? fallback : '';
    }
  }

  function normalizeKey(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  function lookupCell(row, candidates) {
    const map = {};
    Object.keys(row || {}).forEach(function (key) {
      map[normalizeKey(key)] = key;
    });
    for (let i = 0; i < candidates.length; i += 1) {
      const match = map[normalizeKey(candidates[i])];
      if (match !== undefined) return row[match];
    }
    return undefined;
  }

  function tableToObjects(table) {
    const labels = (table && table.cols ? table.cols : []).map(function (col) {
      return String(col && col.label ? col.label : '').trim();
    });
    return (table && table.rows ? table.rows : []).map(function (row) {
      const obj = {};
      (row && row.c ? row.c : []).forEach(function (cell, index) {
        const key = labels[index] || ('col' + index);
        obj[key] = cell === undefined || cell === null ? '' : cell;
        obj[normalizeKey(key)] = cell === undefined || cell === null ? '' : cell;
      });
      return obj;
    });
  }

  function strFromCell(cell) {
    if (cell === null || cell === undefined) return '';
    if (cell.f !== undefined && cell.f !== null) return safeText(cell.f, '');
    if (cell.v !== undefined && cell.v !== null) return safeText(cell.v, '');
    return '';
  }

  function numFromCell(cell) {
    if (cell === null || cell === undefined) return 0;
    if (typeof cell === 'number' && Number.isFinite(cell)) return cell;
    if (cell.v !== undefined && cell.v !== null) {
      if (typeof cell.v === 'number' && Number.isFinite(cell.v)) return cell.v;
      if (typeof cell.v === 'string') {
        const cleaned = cell.v.replace(/\s/g, '').replace(',', '.');
        const n = Number(cleaned);
        return Number.isFinite(n) ? n : 0;
      }
    }
    if (typeof cell === 'string') {
      const cleaned = cell.replace(/\s/g, '').replace(',', '.');
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  }

  function loadSheetJSONP(sheetId, sheetName, options) {
    const sheetCache = (window.__KBK_SHEET_CACHE__ = window.__KBK_SHEET_CACHE__ || {});
    const cacheKey = String(sheetId) + '|' + String(sheetName);
    const cacheMs = (options && options.cacheMs) || 600000;
    const cached = sheetCache[cacheKey];
    if (cached && cached.expiresAt && Date.now() < cached.expiresAt && cached.table) {
      return Promise.resolve(cached.table);
    }
    if (cached && cached.promise) {
      return cached.promise;
    }

    const promise = new Promise(function (resolve, reject) {
      const cbName = 'gvizCb_' + String(sheetName).replace(/[^a-zA-Z0-9]/g, '') + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
      const url = 'https://docs.google.com/spreadsheets/d/' + sheetId + '/gviz/tq?tqx=out:json;responseHandler:' + cbName + '&sheet=' + encodeURIComponent(sheetName) + '&t=' + Date.now();
      const script = document.createElement('script');
      let settled = false;

      const cleanup = function () {
        try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      };

      const timer = setTimeout(function () {
        if (settled) return;
        settled = true;
        cleanup();
        delete sheetCache[cacheKey];
        reject(new Error('Przekroczono czas oczekiwania na arkusz "' + sheetName + '"'));
      }, (options && options.timeoutMs) || 15000);

      window[cbName] = function (json) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        cleanup();
        if (!json || !json.table) {
          delete sheetCache[cacheKey];
          reject(new Error('Nieprawidłowa odpowiedź dla arkusza "' + sheetName + '"'));
          return;
        }
        sheetCache[cacheKey] = { table: json.table, expiresAt: Date.now() + cacheMs };
        resolve(json.table);
      };

      script.onerror = function () {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        cleanup();
        delete sheetCache[cacheKey];
        reject(new Error('Nie udało się załadować arkusza "' + sheetName + '"'));
      };

      script.src = url;
      document.head.appendChild(script);
    });

    sheetCache[cacheKey] = { promise: promise };
    return promise;
  }

  window.KBKShared = {
    safeText: safeText,
    normalizeKey: normalizeKey,
    lookupCell: lookupCell,
    tableToObjects: tableToObjects,
    strFromCell: strFromCell,
    numFromCell: numFromCell,
    loadSheetJSONP: loadSheetJSONP
  };
})();
