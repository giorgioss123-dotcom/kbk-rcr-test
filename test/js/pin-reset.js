(function (window, document) {
  'use strict';

  var LOCKED_MESSAGE = 'Konto zablokowane. Zbyt wiele razy podano niepoprawny PIN. Czy chcesz teraz ustawić nowy?';

  function attach(options) {
    options = options || {};
    if (!document.getElementById('kbk-pin-reset-styles')) {
      var style = document.createElement('style');
      style.id = 'kbk-pin-reset-styles';
      style.textContent = '.kbk-pin-reset{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(6,29,35,.78);backdrop-filter:blur(8px)}' +
        '.kbk-pin-reset.hidden{display:none}.kbk-pin-reset-prompt.hidden,.kbk-pin-reset-form.hidden,.kbk-pin-reset-success.hidden{display:none}.kbk-pin-reset-card{width:min(460px,100%);max-height:calc(100vh - 40px);overflow:auto;padding:32px 30px 28px;background:#f4eee0;color:#1a252a;border:1px solid rgba(0,0,0,.12);box-shadow:10px 10px 0 rgba(0,0,0,.28)}' +
        '.kbk-pin-reset-prompt{text-align:center}.kbk-pin-reset-kicker{margin:0 0 18px;font:500 .68rem/1.2 "IBM Plex Mono",monospace;letter-spacing:.16em;text-transform:uppercase;color:#7a6f4d}.kbk-pin-reset-message{margin:0 auto 26px;max-width:34rem;line-height:1.55;color:#a44650}.kbk-pin-reset-actions{display:flex;justify-content:center;gap:10px}.kbk-pin-reset-actions button{min-width:92px}' +
        '.kbk-pin-reset-actions button,.kbk-pin-reset-form button{border:1px solid #0c3038;background:#0c3038;color:#f4eee0;padding:12px 16px;cursor:pointer;font-family:"IBM Plex Mono",monospace;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;transition:background .18s,color .18s}' +
        '.kbk-pin-reset-actions button:hover,.kbk-pin-reset-form button:hover{background:#1a5a6b}.kbk-pin-reset-actions button:last-child,.kbk-pin-reset-form .kbk-pin-reset-cancel{background:transparent;color:#0c3038}.kbk-pin-reset-actions button:last-child:hover,.kbk-pin-reset-form .kbk-pin-reset-cancel:hover{background:rgba(12,48,56,.08)}.kbk-pin-reset-form.hidden{display:none}' +
        '.kbk-pin-reset-form h2,.kbk-pin-reset-success h2{margin:0 0 8px;font:400 1.7rem/1.1 Anton,sans-serif;letter-spacing:.01em;text-transform:uppercase;color:#0c3038}.kbk-pin-reset-form-intro,.kbk-pin-reset-success p{margin:0 0 22px;color:#7a6f4d;line-height:1.5;font-size:.9rem}.kbk-pin-reset-success{text-align:center}.kbk-pin-reset-success.hidden{display:none}.kbk-pin-reset-success .kbk-pin-reset-close{width:100%;margin-top:4px}' +
        '.kbk-pin-reset-form label{display:block;margin:14px 0 6px;font:500 .68rem/1.2 "IBM Plex Mono",monospace;letter-spacing:.14em;text-transform:uppercase;color:#0c3038}' +
        '.kbk-pin-reset-form label:first-child{margin-top:0}.kbk-pin-reset-form input{display:block;width:100%;min-height:46px;border:1px solid rgba(12,48,56,.18);background:#fffdf7;padding:12px 13px;color:#1a252a;font:15px Archivo,sans-serif}.kbk-pin-reset-form input:focus{outline:2px solid rgba(26,90,107,.28);outline-offset:1px;border-color:#1a5a6b}' +
        '.kbk-pin-reset-form button{width:100%;margin-top:22px}.kbk-pin-reset-form .kbk-pin-reset-cancel{margin-top:10px}.kbk-pin-reset-feedback{margin:14px 0 0;font-size:.85rem;line-height:1.45}.kbk-pin-reset-feedback.error{color:#a44650}.kbk-pin-reset-feedback.ok{color:#4d7a5f}@media(max-width:480px){.kbk-pin-reset{padding:14px}.kbk-pin-reset-card{padding:26px 20px 22px;box-shadow:6px 6px 0 rgba(0,0,0,.25)}}';
      document.head.appendChild(style);
    }
    var modal = document.createElement('div');
    modal.className = 'kbk-pin-reset hidden';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = '<div class="kbk-pin-reset-card">' +
      '<div class="kbk-pin-reset-prompt">' +
      '<p class="kbk-pin-reset-kicker">Bezpieczeństwo konta</p>' +
      '<p class="kbk-pin-reset-message">' + LOCKED_MESSAGE + '</p>' +
      '<div class="kbk-pin-reset-actions">' +
      '<button type="button" data-pin-reset="yes">TAK</button>' +
      '<button type="button" data-pin-reset="no">NIE</button>' +
      '</div></div>' +
      '<form class="kbk-pin-reset-form hidden">' +
      '<h2>Ustaw nowy PIN</h2>' +
      '<p class="kbk-pin-reset-form-intro">Podaj dane konta. Na podany adres e-mail wyślemy link potwierdzający.</p>' +
      '<label>Login</label><input name="login" autocomplete="username" required>' +
      '<label>E-mail</label><input name="email" type="email" autocomplete="email" required>' +
      '<label>Nowy PIN</label><input name="newPin" type="password" inputmode="numeric" maxlength="6" autocomplete="new-password" required>' +
      '<label>Potwierdź PIN</label><input name="confirmPin" type="password" inputmode="numeric" maxlength="6" autocomplete="new-password" required>' +
      '<button type="submit">Wyślij link potwierdzający</button>' +
      '<button type="button" class="kbk-pin-reset-cancel">Anuluj</button>' +
      '<p class="kbk-pin-reset-feedback" aria-live="polite"></p>' +
      '</form>' +
      '<div class="kbk-pin-reset-success hidden">' +
      '<p class="kbk-pin-reset-kicker">Reset PIN-u</p>' +
      '<h2>Sprawdź e-mail</h2>' +
      '<p class="kbk-pin-reset-success-message">Wysłaliśmy link potwierdzający zmianę PIN-u. Kliknij go, aby zakończyć operację.</p>' +
      '<button type="button" class="kbk-pin-reset-close">Zamknij</button>' +
      '</div></div>';
    document.body.appendChild(modal);

    var actions = modal.querySelector('.kbk-pin-reset-actions');
    var form = modal.querySelector('.kbk-pin-reset-form');
    var prompt = modal.querySelector('.kbk-pin-reset-prompt');
    var success = modal.querySelector('.kbk-pin-reset-success');
    var feedback = modal.querySelector('.kbk-pin-reset-feedback');
    var submit = form.querySelector('[type="submit"]');
    var loginField = form.querySelector('[name="login"]');

    function close() {
      modal.classList.add('hidden');
      actions.classList.remove('hidden');
      prompt.classList.remove('hidden');
      form.classList.add('hidden');
      success.classList.add('hidden');
      form.reset();
      feedback.textContent = '';
      feedback.className = 'kbk-pin-reset-feedback';
      submit.disabled = false;
    }

    function open(login) {
      close();
      modal.classList.remove('hidden');
      loginField.value = String(login || '').trim().toLowerCase();
      modal.querySelector('[data-pin-reset="no"]').focus();
    }

    modal.querySelector('[data-pin-reset="no"]').addEventListener('click', close);
    modal.querySelector('.kbk-pin-reset-cancel').addEventListener('click', close);
    modal.querySelector('[data-pin-reset="yes"]').addEventListener('click', function () {
      prompt.classList.add('hidden');
      form.classList.remove('hidden');
      loginField.focus();
    });
    modal.querySelector('.kbk-pin-reset-close').addEventListener('click', close);
    modal.addEventListener('click', function (event) {
      if (event.target === modal) close();
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var values = {
        login: loginField.value.trim().toLowerCase(),
        email: form.querySelector('[name="email"]').value.trim().toLowerCase(),
        newPin: form.querySelector('[name="newPin"]').value.trim(),
        confirmPin: form.querySelector('[name="confirmPin"]').value.trim()
      };
      if (!/^[A-Za-z0-9._-]{3,32}$/.test(values.login) ||
          !/^\d{6}$/.test(values.newPin) || values.newPin !== values.confirmPin) {
        feedback.textContent = 'Podaj poprawny login oraz dwa identyczne PIN-y składające się z 6 cyfr.';
        feedback.className = 'kbk-pin-reset-feedback error';
        return;
      }
      submit.disabled = true;
      feedback.textContent = 'Wysyłanie wiadomości…';
      feedback.className = 'kbk-pin-reset-feedback';
      fetch(options.webAppUrl, {
        method: 'POST',
        headers: {'Content-Type': 'text/plain;charset=utf-8'},
        body: JSON.stringify({action: 'requestPinReset', login: values.login, email: values.email, newPin: values.newPin, confirmPin: values.confirmPin})
      })
        .then(function (response) { return response.json(); })
        .then(function (data) {
          feedback.textContent = data && data.message ? data.message : 'Nie udało się wysłać wiadomości.';
          feedback.className = 'kbk-pin-reset-feedback ' + (data && data.ok ? 'ok' : 'error');
          if (data && data.ok) {
            form.classList.add('hidden');
            success.classList.remove('hidden');
            success.querySelector('.kbk-pin-reset-success-message').textContent = data.message || 'Wysłaliśmy link potwierdzający zmianę PIN-u. Kliknij go, aby zakończyć operację.';
          } else {
            submit.disabled = false;
          }
        })
        .catch(function () {
          feedback.textContent = 'Nie udało się połączyć z backendem.';
          feedback.className = 'kbk-pin-reset-feedback error';
          submit.disabled = false;
        });
    });

    return {open: open, close: close, isLocked: function (data) { return data && data.error === 'account_locked'; }};
  }

  window.KBKPinReset = {attach: attach};
}(window, document));