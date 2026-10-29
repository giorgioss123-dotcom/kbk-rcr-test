(function () {
  'use strict';

  var activeScanners = [];

  function create(options) {
    var mount = document.getElementById(options.mountId);
    var pinFields = options.pinFieldIds.map(function (id) {
      return document.getElementById(id);
    }).filter(Boolean);
    var mode = 'pin';
    var qrHash = '';
    var stream = null;
    var cameraStarting = false;
    var animationFrame = null;
    var video;
    var canvas;
    var status;
    var confirmationSummary;
    var pinButton;
    var qrButton;

    if (!mount || pinFields.length !== options.pinFieldIds.length) {
      throw new Error('Nie udało się przygotować uwierzytelniania kodem QR.');
    }

    mount.innerHTML =
      (options.methodLabel ? '<div class="qr-auth-method-row"><div class="qr-auth-method-label"></div>' : '') +
      '<div class="qr-auth-methods" role="group" aria-label="' + (options.methodLabel || 'Sposób uwierzytelnienia') + '">' +
        '<button type="button" class="qr-auth-method" data-auth-method="qr" aria-pressed="false">' + (options.qrLabel || 'Skanuj kod QR z paszportu') + '</button>' +
        '<button type="button" class="qr-auth-method active" data-auth-method="pin" aria-pressed="true">Login i PIN</button>' +
      '</div>' +
      (options.methodLabel ? '</div>' : '') +
      '<div class="qr-auth-scanner" hidden>' +
        '<video class="qr-auth-video" playsinline muted hidden></video>' +
        '<div class="qr-auth-status" role="status" aria-live="assertive"></div>' +
      '</div>';
    mount.classList.add('qr-auth');

    var style = document.getElementById('qr-auth-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'qr-auth-styles';
      style.textContent =
        '.qr-auth-method-row{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin:14px 0}' +
        '.qr-auth-method-label{margin:0}' +
        '.qr-auth-method-row .qr-auth-methods{margin:0}' +
        '.qr-auth-method-row .qr-auth-method{flex:1 1 0;min-width:0;text-align:center}' +
        '.qr-auth-methods{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}' +
        '.qr-auth-method{border:1px solid var(--teal-deep);background:transparent;color:var(--teal-deep);padding:10px 12px;font:500 .72rem "IBM Plex Mono",monospace;letter-spacing:.06em;cursor:pointer}' +
        '.qr-auth-method.active{background:var(--teal-deep);color:var(--paper,#f4eee0)}' +
        '.qr-auth-pin-fields[hidden],.qr-auth-scanner[hidden]{display:none!important}' +
        '.qr-auth-status{font-size:.9rem;margin:12px 0;color:var(--paper-ink,#1a252a)}' +
        '.qr-auth-result{display:flex;align-items:flex-start;gap:12px;padding:16px;border:2px solid var(--pos,#4d7a5f);border-radius:8px;background:rgba(77,122,95,.12)}' +
        '.qr-auth-result-icon{display:grid;place-items:center;flex:0 0 30px;width:30px;height:30px;border-radius:50%;background:var(--pos,#4d7a5f);color:#fff;font-size:1.2rem;font-weight:700}' +
        '.qr-auth-result-content{display:flex;flex-direction:column;gap:6px;min-width:0}' +
        '.qr-auth-result-title{font-size:1rem;line-height:1.3;font-weight:700;color:var(--pos-dk,#31553f)}' +
        '.qr-auth-result-summary{font-weight:600;line-height:1.4}' +
        '.qr-auth-result-message{font-size:.84rem;line-height:1.5}' +
        '.qr-auth-video{display:block;width:100%;max-width:360px;max-height:50vh;background:#111;object-fit:cover}' +
        '.qr-auth-video[hidden]{display:none}' +
        '.qr-auth-confirm-ready{outline:2px solid var(--gold,#d4a95f)!important;outline-offset:3px!important;box-shadow:0 0 0 6px rgba(212,169,95,.4)!important}';
      document.head.appendChild(style);
    }

    var scanner = mount.querySelector('.qr-auth-scanner');
    var methodLabel = mount.querySelector('.qr-auth-method-label');
    video = mount.querySelector('.qr-auth-video');
    canvas = document.createElement('canvas');
    var context = canvas.getContext('2d', {willReadFrequently: true});
    status = mount.querySelector('.qr-auth-status');
    var confirmButton = options.confirmButtonId ? document.getElementById(options.confirmButtonId) : null;
    qrButton = mount.querySelector('[data-auth-method="qr"]');
    pinButton = mount.querySelector('[data-auth-method="pin"]');
    if (methodLabel) methodLabel.textContent = options.methodLabel;

    function stopCamera() {
      var wasActive = !!stream || cameraStarting;
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      if (stream) {
        stream.getTracks().forEach(function (track) { track.stop(); });
        stream = null;
      }
      video.pause();
      video.srcObject = null;
      video.hidden = true;
      if (wasActive && typeof options.onScanStateChange === 'function') options.onScanStateChange(false);
    }

    function setMode(nextMode) {
      mode = nextMode;
      qrHash = '';
      stopCamera();
      pinFields.forEach(function (element) {
        element.classList.add('qr-auth-pin-fields');
        element.hidden = mode === 'qr';
      });
      scanner.hidden = mode !== 'qr';
      qrButton.classList.toggle('active', mode === 'qr');
      qrButton.setAttribute('aria-pressed', String(mode === 'qr'));
      pinButton.classList.toggle('active', mode === 'pin');
      pinButton.setAttribute('aria-pressed', String(mode === 'pin'));
      if (confirmButton) confirmButton.classList.remove('qr-auth-confirm-ready');
      status.textContent = '';
      confirmationSummary = null;
      if (typeof options.onModeChange === 'function') options.onModeChange(mode);
      if (mode === 'qr') {
        scanner.hidden = options.scanOnSelect === false;
        if (options.scanOnSelect !== false) startCamera();
      }
    }

    function acceptPayload(payload) {
      var scanned = String(payload || '').trim();
      if (!/^[a-f0-9]{64}$/i.test(scanned)) {
        status.textContent = 'Ten kod QR nie jest prawidłowym kodem paszportu.';
        return false;
      }
      stopCamera();
      if (typeof options.onQrScan === 'function') {
        qrHash = '';
        status.textContent = 'Kod QR odczytany. Wysyłanie zamówienia…';
        options.onQrScan(scanned);
        return true;
      }
      qrHash = scanned;
      var summary = typeof options.getConfirmationSummary === 'function'
        ? options.getConfirmationSummary()
        : '';
      status.innerHTML =
        '<div class="qr-auth-result">' +
          '<div class="qr-auth-result-icon" aria-hidden="true">✓</div>' +
          '<div class="qr-auth-result-content">' +
            '<strong class="qr-auth-result-title">Kod QR odczytany</strong>' +
            (summary ? '<strong class="qr-auth-result-summary"></strong>' : '') +
            '<span class="qr-auth-result-message">Skanowanie nie wysłało operacji. Sprawdź szczegóły i zatwierdź ją przyciskiem poniżej.</span>' +
          '</div>' +
        '</div>';
      confirmationSummary = status.querySelector('.qr-auth-result-summary');
      if (confirmationSummary) confirmationSummary.textContent = summary;
      if (confirmButton) {
        confirmButton.classList.add('qr-auth-confirm-ready');
        confirmButton.scrollIntoView({behavior: 'smooth', block: 'center'});
        confirmButton.focus({preventScroll: true});
      }
      return true;
    }

    function scanFrame() {
      if (!stream || mode !== 'qr') return;
      if (video.readyState >= 2 && video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (window.BarcodeDetector) {
          scannerDetector.detect(video).then(function (codes) {
            if (!codes.length || !acceptPayload(codes[0].rawValue)) {
              if (stream) animationFrame = requestAnimationFrame(scanFrame);
            }
          }).catch(function () {
            stopCamera();
            status.textContent = 'Nie udało się odczytać kodu QR z kamery.';
            if (typeof options.onScanError === 'function') options.onScanError();
          });
          return;
        }
        var image = context.getImageData(0, 0, canvas.width, canvas.height);
        var result = window.jsQR(image.data, image.width, image.height, {inversionAttempts: 'dontInvert'});
        if (result && acceptPayload(result.data)) return;
      }
      animationFrame = requestAnimationFrame(scanFrame);
    }

    var scannerDetector = null;
    if (window.BarcodeDetector) {
      try {
        scannerDetector = new window.BarcodeDetector({formats: ['qr_code']});
      } catch (error) {
        scannerDetector = null;
      }
    }

    function startCamera() {
      qrHash = '';
      if (mode !== 'qr' || stream || cameraStarting) return;
      scanner.hidden = false;
      if (!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        status.textContent = 'Skanowanie wymaga bezpiecznego połączenia HTTPS i dostępu do kamery.';
        if (typeof options.onScanError === 'function') options.onScanError();
        return;
      }
      if (!scannerDetector && !window.jsQR) {
        status.textContent = 'Nie udało się uruchomić skanera QR. Odśwież stronę i spróbuj ponownie.';
        if (typeof options.onScanError === 'function') options.onScanError();
        return;
      }
      cameraStarting = true;
      if (typeof options.onScanStateChange === 'function') options.onScanStateChange(true);
      status.textContent = 'Oczekiwanie na dostęp do kamery…';
      navigator.mediaDevices.getUserMedia({video: {facingMode: {ideal: 'environment'}}, audio: false})
        .then(function (cameraStream) {
          if (mode !== 'qr') {
            cameraStream.getTracks().forEach(function (track) { track.stop(); });
            return;
          }
          stream = cameraStream;
          video.srcObject = stream;
          video.hidden = false;
          return video.play();
        })
        .then(function () {
          if (stream) {
            status.textContent = 'Przytrzymaj kod QR z paszportu przed kamerą.';
            animationFrame = requestAnimationFrame(scanFrame);
          }
        })
        .catch(function () {
          stopCamera();
          if (mode === 'qr') {
            status.textContent = 'Brak dostępu do kamery. Zezwól na użycie kamery i spróbuj ponownie.';
            if (typeof options.onScanError === 'function') options.onScanError();
          }
        })
        .finally(function () {
          cameraStarting = false;
        });
    }

    qrButton.addEventListener('click', function () { setMode('qr'); });
    pinButton.addEventListener('click', function () { setMode('pin'); });
    activeScanners.push({
      stop: stopCamera,
      reset: function () {
        setMode('pin');
        document.getElementById(options.loginInputId).value = '';
        document.getElementById(options.pinInputId).value = '';
      }
    });

    return {
      credentials: function () {
        if (mode === 'qr') return qrHash ? {qrHash: qrHash} : null;
        return {
          login: document.getElementById(options.loginInputId).value.trim().toLowerCase(),
          pin: document.getElementById(options.pinInputId).value.trim()
        };
      },
      refreshConfirmationSummary: function () {
        if (confirmationSummary && typeof options.getConfirmationSummary === 'function') {
          confirmationSummary.textContent = options.getConfirmationSummary();
        }
      },
      rescan: function () {
        setMode('qr');
      },
      setDisabled: function (disabled) {
        qrButton.disabled = disabled;
        pinButton.disabled = disabled;
      },
      clearStatus: function () {
        status.textContent = '';
      },
      isQrMode: function () {
        return mode === 'qr';
      },
      startScan: function () {
        if (mode === 'qr') startCamera();
      },
      reset: function () {
        setMode('pin');
        document.getElementById(options.loginInputId).value = '';
        document.getElementById(options.pinInputId).value = '';
      }
    };
  }

  window.KBKQrAuth = {
    create: create,
    stopAll: function () {
      activeScanners.forEach(function (scanner) { scanner.stop(); });
    },
    resetAll: function () {
      activeScanners.forEach(function (scanner) { scanner.reset(); });
    }
  };

  window.addEventListener('pagehide', window.KBKQrAuth.stopAll);
})();
