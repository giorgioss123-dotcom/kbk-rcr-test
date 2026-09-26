(function () {
  const CONFIG = window.KBK_FEEDBACK_CONFIG || { categories: [], enabled: false };
  if (!CONFIG.enabled) return;

  const CATEGORIES = Array.isArray(CONFIG.categories) && CONFIG.categories.length
    ? CONFIG.categories
    : ['Brakująca funkcja', 'Błąd lub coś nie działa', 'Pomysł na ulepszenie', 'Inna uwaga / pytanie'];

  const styles = document.createElement('style');
  styles.textContent = [
    '.kbk-feedback-fab{position:fixed;right:20px;bottom:20px;z-index:1200;padding:12px 18px;border:none;border-radius:999px;background:#d4a95f;color:#0c3038;font-weight:700;box-shadow:0 10px 24px rgba(0,0,0,.25);cursor:pointer;letter-spacing:.04em;text-transform:uppercase;font-family:"IBM Plex Mono",monospace;}',
    '.kbk-feedback-fab:hover{filter:brightness(1.05)}',
    '.kbk-feedback-modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(12,48,56,.72);z-index:1300;}',
    '.kbk-feedback-modal.open{display:flex;}',
    '.kbk-feedback-card{width:min(560px,92vw);max-height:90vh;overflow:auto;background:#f4eee0;color:#1a252a;padding:28px 28px 22px;border-top:4px solid #0c3038;box-shadow:18px 18px 0 rgba(0,0,0,.22);}',
    '.kbk-feedback-card h2{margin:0 0 16px;font-size:1.6rem;color:#0c3038;}',
    '.kbk-feedback-card label{display:block;margin:16px 0 8px;font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:#7a6f4d;font-family:"IBM Plex Mono",monospace;}',
    '.kbk-feedback-card input, .kbk-feedback-card select, .kbk-feedback-card textarea{width:100%;padding:12px 14px;border:1px solid rgba(12,48,56,.2);background:#fff;color:#1a252a;border-radius:0;font:inherit;}',
    '.kbk-feedback-card textarea{min-height:140px;resize:vertical;}',
    '.kbk-feedback-card .row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}',
    '.kbk-feedback-card .actions{display:flex;justify-content:flex-end;gap:10px;margin-top:18px;}',
    '.kbk-feedback-card button{border:none;cursor:pointer;padding:12px 18px;font-family:"IBM Plex Mono",monospace;text-transform:uppercase;letter-spacing:.08em;}',
    '.kbk-feedback-card .secondary{background:transparent;color:#0c3038;border:1px solid rgba(12,48,56,.5);}',
    '.kbk-feedback-card .primary{background:#0c3038;color:#fff;}',
    '.kbk-feedback-banner{display:none;margin-top:16px;padding:12px 14px;background:rgba(12,48,56,.06);font-size:.92rem;line-height:1.5;}',
    '.kbk-feedback-banner.show{display:block;}',
    '.kbk-feedback-banner.error{background:rgba(164,70,80,.09);color:#9b2f3b;}',
    '.kbk-feedback-banner.ok{background:rgba(86,129,100,.12);color:#25492d;}',
    '.kbk-feedback-attachment{margin-top:14px;padding:12px;border:1px dashed rgba(12,48,56,.35);background:rgba(255,255,255,.3);}',
    '.kbk-feedback-attachment .preview{max-width:100%;max-height:220px;display:none;margin-top:12px;border:1px solid rgba(12,48,56,.15);object-fit:contain;background:#fff;}',
    '.kbk-feedback-attachment .preview.show{display:block;}',
    '@media (max-width:560px){.kbk-feedback-card{padding:22px 18px 18px}.kbk-feedback-card .row{grid-template-columns:1fr}.kbk-feedback-fab{right:14px;bottom:14px;padding:11px 16px}}'
  ].join('');
  document.head.appendChild(styles);

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }

  function createButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'kbk-feedback-fab';
    button.textContent = 'Zgłoś problem / uwagi';
    button.setAttribute('aria-label', 'Zgłoś problem lub uwagi');
    return button;
  }

  function createModal() {
    const modal = document.createElement('div');
    modal.className = 'kbk-feedback-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = [
      '<div class="kbk-feedback-card">',
      '  <h2>Zgłoś problem / uwagi</h2>',
      '  <form id="kbkFeedbackForm" novalidate>',
      '    <label for="kbkFeedbackCategory">Rodzaj problemu</label>',
      '    <select id="kbkFeedbackCategory" name="category" required>',
      '      ' + CATEGORIES.map(function (category) { return '<option value="' + escapeHtml(category) + '">' + escapeHtml(category) + '</option>'; }).join(''),
      '    </select>',
      '    <label for="kbkFeedbackDescription">Krótki opis</label>',
      '    <textarea id="kbkFeedbackDescription" name="description" placeholder="Opisz problem, błąd lub pomysł…" required></textarea>',
      '    <label for="kbkFeedbackReporter">Zgłaszający</label>',
      '    <input id="kbkFeedbackReporter" name="reporter" type="text" maxlength="120" placeholder="Nazwa użytkownika" required>',
      '    <div class="kbk-feedback-attachment">',
      '      <label for="kbkFeedbackAttachment">Załącznik</label>',
      '      <input id="kbkFeedbackAttachment" name="attachment" type="file" accept="image/png,image/jpeg,image/webp">',
      '      <img id="kbkFeedbackPreview" class="preview" alt="Podgląd załącznika">',
      '    </div>',
      '    <div id="kbkFeedbackBanner" class="kbk-feedback-banner" aria-live="polite"></div>',
      '    <div class="actions">',
      '      <button type="button" class="secondary" id="kbkFeedbackCancel">Anuluj</button>',
      '      <button type="submit" class="primary">Wyślij</button>',
      '    </div>',
      '  </form>',
      '</div>',
      ''
    ].join('');
    return modal;
  }

  const button = createButton();
  const modal = createModal();
  const form = modal.querySelector('#kbkFeedbackForm');
  const categorySelect = modal.querySelector('#kbkFeedbackCategory');
  const descriptionInput = modal.querySelector('#kbkFeedbackDescription');
  const reporterInput = modal.querySelector('#kbkFeedbackReporter');
  const attachmentInput = modal.querySelector('#kbkFeedbackAttachment');
  const preview = modal.querySelector('#kbkFeedbackPreview');
  const banner = modal.querySelector('#kbkFeedbackBanner');
  const cancelButton = modal.querySelector('#kbkFeedbackCancel');

  function close() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    form.reset();
    preview.classList.remove('show');
    preview.src = '';
    banner.className = 'kbk-feedback-banner';
    banner.textContent = '';
  }

  function open() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      categorySelect.focus();
    }, 20);
  }

  function readAttachmentDataUrl(file) {
    return new Promise(function (resolve, reject) {
      if (!file) return resolve('');
      if (!/^image\/(png|jpeg|jpg|webp)$/i.test(file.type)) {
        return reject(new Error('Nieobsługiwany typ pliku. Wybierz PNG, JPG/JPEG lub WebP.'));
      }
      if (file.size > 3 * 1024 * 1024) {
        return reject(new Error('Plik jest za duży. Maksymalnie 3 MB.'));
      }
      const reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || '')); };
      reader.onerror = function () { reject(new Error('Nie udało się odczytać pliku.')); };
      reader.readAsDataURL(file);
    });
  }

  attachmentInput.addEventListener('change', function () {
    const file = attachmentInput.files && attachmentInput.files[0];
    if (!file) {
      preview.classList.remove('show');
      preview.src = '';
      return;
    }

    readAttachmentDataUrl(file)
      .then(function (dataUrl) {
        preview.src = dataUrl;
        preview.classList.add('show');
      })
      .catch(function (error) {
        banner.textContent = error.message || 'Nie udało się odczytać załącznika.';
        banner.className = 'kbk-feedback-banner show error';
        preview.classList.remove('show');
        preview.src = '';
        attachmentInput.value = '';
      });
  });

  button.addEventListener('click', open);
  cancelButton.addEventListener('click', close);
  modal.addEventListener('click', function (event) {
    if (event.target === modal) close();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('open')) close();
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const category = categorySelect.value.trim();
    const description = descriptionInput.value.trim();
    const reporter = reporterInput.value.trim();
    const file = attachmentInput.files && attachmentInput.files[0];

    banner.className = 'kbk-feedback-banner';
    banner.textContent = '';

    if (!category) {
      banner.textContent = 'Wybierz rodzaj problemu.';
      banner.className = 'kbk-feedback-banner show error';
      categorySelect.focus();
      return;
    }
    if (description.length < 10) {
      banner.textContent = 'Opis zgłoszenia jest za krótki — minimum 10 znaków.';
      banner.className = 'kbk-feedback-banner show error';
      descriptionInput.focus();
      return;
    }
    if (reporter.length < 2) {
      banner.textContent = 'Podaj nazwę zgłaszającego.';
      banner.className = 'kbk-feedback-banner show error';
      reporterInput.focus();
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Wysyłanie…';

    const payload = {
      action: 'submitFeedback',
      category: category,
      description: description,
      reporter: reporter,
      pageUrl: window.location.href
    };

    readAttachmentDataUrl(file)
      .then(function (dataUrl) {
        payload.attachmentDataUrl = dataUrl;
        return fetch(window.KBK_APP_CONFIG && window.KBK_APP_CONFIG.webAppUrl ? window.KBK_APP_CONFIG.webAppUrl : '', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
      })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data && data.ok) {
          banner.textContent = 'Dziękujemy. Zgłoszenie zostało wysłane.';
          banner.className = 'kbk-feedback-banner show ok';
          form.reset();
          preview.classList.remove('show');
          preview.src = '';
          setTimeout(close, 1200);
          return;
        }

        banner.textContent = (data && data.message) || 'Nie udało się wysłać zgłoszenia.';
        banner.className = 'kbk-feedback-banner show error';
      })
      .catch(function (error) {
        banner.textContent = error && error.message ? error.message : 'Nie udało się wysłać zgłoszenia.';
        banner.className = 'kbk-feedback-banner show error';
      })
      .finally(function () {
        submitButton.disabled = false;
        submitButton.textContent = 'Wyślij';
      });
  });

  document.body.appendChild(button);
  document.body.appendChild(modal);
})();
