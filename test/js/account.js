(function (window, document) {
  'use strict';

  var appConfig = window.KBK_APP_CONFIG;
  var choicePanel = document.getElementById('choicePanel');
  var pageTitle = document.getElementById('pageTitle');
  var pageSubtitle = document.getElementById('pageSubtitle');
  var authPanel = document.getElementById('accountAuthPanel');
  var loginInput = document.getElementById('accountLogin');
  var statusPanel = document.getElementById('accountStatus');
  var actionPanel = document.getElementById('accountActions');
  var backButton = document.getElementById('accountBack');
  var submitButton = document.getElementById('accountSubmit');
  var forms = {
    pin: document.getElementById('pinForm'),
    profile: document.getElementById('profileForm'),
    revokeQr: document.getElementById('qrForm')
  };
  var operationCopy = {
    pin: {
      title: 'Zmiana PIN-u',
      subtitle: 'Ustaw nowy, 6-cyfrowy PIN. Wyślemy link potwierdzający na adres e-mail przypisany do konta.',
      button: 'Wyślij link potwierdzający'
    },
    profile: {
      title: 'Dane kontaktowe i dobrowolne zgody',
      subtitle: 'Wypełnij ponownie dane kontaktowe i wybierz aktualne zgody. Wyślemy link potwierdzający na adres e-mail przypisany do konta.',
      button: 'Wyślij link potwierdzający'
    },
    revokeQr: {
      title: 'Unieważnienie kodu QR',
      subtitle: 'Wyślemy link potwierdzający unieważnienie na adres e-mail przypisany do konta.',
      button: 'Wyślij link potwierdzający'
    }
  };
  var activeOperation = null;
  var requestPending = false;

  var errors = {
    account_not_found: 'Nie udało się znaleźć danych konta.',
    address_required: 'Aby wyrazić zgodę na kontakt pocztowy, podaj adres.',
    email_unavailable: 'Konto nie ma adresu e-mail do potwierdzenia.',
    invalid_consent: 'Odśwież formularz i ustaw dobrowolne zgody ponownie.',
    invalid_operation: 'Wybierz poprawną operację.',
    invalid_pin: 'Nowe PIN-y muszą być identyczne i składać się z 6 cyfr.',
    invalid_profile: 'Sprawdź dane formularza i spróbuj ponownie.',
    invalid_login: 'Podaj poprawny login (3–32 znaki: litery, cyfry, _, -, .).',
    mail_failed: 'Nie udało się wysłać wiadomości. Operacja nie została przyjęta; spróbuj ponownie później.',
    pending_account_action: 'Dla tego konta oczekuje już potwierdzenie. Sprawdź pocztę i folder spam.',
    phone_required: 'Aby wyrazić zgodę na kontakt WhatsApp, podaj numer telefonu.',
    server_error: 'Nie udało się rozpocząć operacji. Spróbuj ponownie później.'
  };

  function showStatus(message, type) {
    statusPanel.textContent = message || '';
    statusPanel.className = 'account-status' + (message ? ' show ' + type : '');
  }

  function setFormControlsDisabled(form, disabled) {
    Array.prototype.forEach.call(form.querySelectorAll('input, textarea, select'), function (control) {
      control.disabled = disabled;
    });
    loginInput.disabled = disabled;
    backButton.disabled = disabled;
  }

  function resetActiveForm() {
    if (!activeOperation) return;
    var form = forms[activeOperation];
    form.reset();
    form.dataset.pending = '';
    requestPending = false;
    showStatus('', '');
    setFormControlsDisabled(form, false);
    loginInput.value = '';
    submitButton.disabled = false;
  }

  function showChoicePanel() {
    if (activeOperation) {
      resetActiveForm();
      forms[activeOperation].classList.add('hidden');
    }
    activeOperation = null;
    authPanel.classList.add('hidden');
    statusPanel.classList.remove('show');
    actionPanel.classList.add('hidden');
    backButton.classList.add('hidden');
    choicePanel.classList.remove('hidden');
    pageTitle.textContent = 'Zarządzanie kontem';
    pageSubtitle.textContent = 'Wybierz czynność, którą chcesz wykonać.';
  }

  function showOperation(operation) {
    if (!Object.prototype.hasOwnProperty.call(forms, operation)) return;
    if (activeOperation) forms[activeOperation].classList.add('hidden');
    activeOperation = operation;
    requestPending = false;
    var form = forms[operation];
    form.classList.remove('hidden');
    form.appendChild(authPanel);
    form.appendChild(statusPanel);
    form.appendChild(actionPanel);
    choicePanel.classList.add('hidden');
    authPanel.classList.remove('hidden');
    actionPanel.classList.remove('hidden');
    backButton.classList.remove('hidden');
    pageTitle.textContent = operationCopy[operation].title;
    pageSubtitle.textContent = operationCopy[operation].subtitle;
    showStatus('', '');
    submitButton.disabled = false;
    submitButton.textContent = operationCopy[operation].button;
    loginInput.value = '';
  }

  function profilePayload(form) {
    return {
      imie: form.elements.imie.value.trim(),
      nazwisko: form.elements.nazwisko.value.trim(),
      adres: form.elements.adres.value.trim(),
      telefon: form.elements.telefon.value.trim(),
      zgodaNewsletter: form.elements.zgodaNewsletter.checked,
      zgodaWhatsapp: form.elements.zgodaWhatsapp.checked,
      zgodaPocztowy: form.elements.zgodaPocztowy.checked
    };
  }

  function validateOperation(form) {
    if (activeOperation === 'pin') {
      var newPin = form.elements.newPin.value.trim();
      var confirmPin = form.elements.confirmPin.value.trim();
      if (!/^\d{6}$/.test(newPin) || newPin !== confirmPin) {
        return {ok: false, message: errors.invalid_pin};
      }
      return {ok: true, payload: {newPin: newPin, confirmPin: confirmPin}};
    }

    if (activeOperation === 'profile') {
      var payload = profilePayload(form);
      if (payload.zgodaWhatsapp && !payload.telefon) return {ok: false, message: errors.phone_required};
      if (payload.zgodaPocztowy && !payload.adres) return {ok: false, message: errors.address_required};
      return {ok: true, payload: payload};
    }
    return {ok: true, payload: {}};
  }

  function requestMessage(operation) {
    if (operation === 'pin') return 'Wysłaliśmy link potwierdzający zmianę PIN-u. Sprawdź pocztę i folder spam.';
    if (operation === 'profile') return 'Wysłaliśmy link potwierdzający aktualizację danych i dobrowolnych zgód. Sprawdź pocztę i folder spam.';
    return 'Wysłaliśmy link potwierdzający unieważnienie kodu QR. Stary kod będzie działał do chwili potwierdzenia.';
  }

  function lockAfterUncertainResult(form, message) {
    form.dataset.pending = 'true';
    requestPending = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Sprawdź pocztę przed ponowieniem';
    setFormControlsDisabled(form, true);
    backButton.disabled = false;
    showStatus(message, 'error');
  }

  function submitRequest(form, payload, login) {
    requestPending = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Wysyłanie…';
    setFormControlsDisabled(form, true);
    fetch(appConfig.webAppUrl, {
      method: 'POST',
      headers: {'Content-Type': 'text/plain;charset=utf-8'},
      body: JSON.stringify(Object.assign({
        action: 'requestAccountAction',
        operation: activeOperation,
        login: login
      }, payload))
    }).then(function (response) {
      if (!response.ok) throw new Error('Nieoczekiwany status odpowiedzi: ' + response.status);
      return response.json();
    }).then(function (result) {
      if (result && result.ok) {
        form.dataset.pending = 'true';
        submitButton.textContent = 'Sprawdź e-mail';
        setFormControlsDisabled(form, true);
        backButton.disabled = false;
        showStatus(requestMessage(activeOperation), 'ok');
        return;
      }
      requestPending = false;
      setFormControlsDisabled(form, false);
      submitButton.disabled = false;
      submitButton.textContent = operationCopy[activeOperation].button;
      showStatus(result && result.error && errors[result.error]
        ? errors[result.error]
        : 'Nie udało się wysłać prośby. Spróbuj ponownie później.', 'error');
    }).catch(function (error) {
      console.error('Nie udało się ustalić wyniku prośby o zmianę konta.', error);
      lockAfterUncertainResult(form, 'Nie znamy wyniku wysłania. Prośba mogła zostać przyjęta. Sprawdź pocztę i folder spam przed ponowieniem.');
    });
  }

  document.querySelectorAll('[data-account-choice]').forEach(function (button) {
    button.addEventListener('click', function () {
      showOperation(button.getAttribute('data-account-choice'));
    });
  });

  backButton.addEventListener('click', showChoicePanel);

  Object.keys(forms).forEach(function (operation) {
    var form = forms[operation];
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (form.dataset.pending === 'true' || requestPending) return;

      var validated = validateOperation(form);
      if (!validated.ok) {
        showStatus(validated.message, 'error');
        return;
      }

      var login = loginInput.value.trim();
      if (!/^[A-Za-z0-9._-]{3,32}$/.test(login)) {
        showStatus(errors.invalid_login, 'error');
        return;
      }

      showStatus('', '');
      submitRequest(form, validated.payload, login);
    });
  });
})(window, document);
