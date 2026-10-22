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
    var animationFrame = null;
    var video;
    var canvas;
    var status;
    var scanButton;
    var pinButton;
    var qrButton;

    if (!mount || pinFields.length !== options.pinFieldIds.length) {
      throw new Error('Nie udało się przygotować uwierzytelniania kodem QR.');
    }

    mount.innerHTML =
      '<div class="qr-auth-methods" role="group" aria-label="Sposób uwierzytelnienia">' +
        '<button type="button" class="qr-auth-method" data-auth-method="qr" aria-pressed="false">Skanuj kod QR z paszportu</button>' +
        '<button type="button" class="qr-auth-method active" data-auth-method="pin" aria-pressed="true">Login i PIN</button>' +
      '</div>' +
      '<div class="qr-auth-scanner" hidden>' +
        '<p class="qr-auth-hint">Kod QR można zeskanować kamerą — wklejanie kodu nie jest dostępne.</p>' +
        '<button type="button" class="qr-auth-scan-button">Uruchom skaner</button>' +
        '<video class="qr-auth-video" playsinline muted hidden></video>' +
        '<p class="qr-auth-status" role="status" aria-live="polite"></p>' +
      '</div>';
    mount.classList.add('qr-auth');

    var style = document.getElementById('qr-auth-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'qr-auth-styles';
      style.textContent =
        '.qr-auth-methods{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}' +
        '.qr-auth-method,.qr-auth-scan-button{border:1px solid var(--teal-deep);background:transparent;color:var(--teal-deep);padding:10px 12px;font:500 .72rem "IBM Plex Mono",monospace;letter-spacing:.06em;cursor:pointer}' +
        '.qr-auth-method.active,.qr-auth-scan-button{background:var(--teal-deep);color:var(--paper,#f4eee0)}' +
        '.qr-auth-pin-fields[hidden],.qr-auth-scanner[hidden]{display:none!important}' +
        '.qr-auth-hint,.qr-auth-status{font-size:.82rem;margin:8px 0;color:var(--paper-muted,#7a6f4d)}' +
        '.qr-auth-video{display:block;width:100%;max-width:360px;max-height:50vh;margin-top:12px;background:#111;object-fit:cover}' +
        '.qr-auth-video[hidden]{display:none}';
      document.head.appendChild(style);
    }

    var scanner = mount.querySelector('.qr-auth-scanner');
    video = mount.querySelector('.qr-auth-video');
    canvas = document.createElement('canvas');
    var context = canvas.getContext('2d', {willReadFrequently: true});
    status = mount.querySelector('.qr-auth-status');
    scanButton = mount.querySelector('.qr-auth-scan-button');
    qrButton = mount.querySelector('[data-auth-method="qr"]');
    pinButton = mount.querySelector('[data-auth-method="pin"]');

    function stopCamera() {
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
      scanButton.hidden = false;
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
      status.textContent = mode === 'qr' ? 'Zeskanuj kod QR widoczny na paszporcie.' : '';
    }

    function acceptPayload(payload) {
      var scanned = String(payload || '').trim();
      if (!/^[a-f0-9]{64}$/i.test(scanned)) {
        status.textContent = 'Ten kod QR nie jest prawidłowym kodem paszportu.';
        stopCamera();
        return;
      }
      qrHash = scanned;
      stopCamera();
      status.textContent = 'Kod QR zeskanowany. Możesz kontynuować.';
    }

    function scanFrame() {
      if (!stream || mode !== 'qr') return;
      if (video.readyState >= 2 && video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (window.BarcodeDetector) {
          scannerDetector.detect(video).then(function (codes) {
            if (codes.length) acceptPayload(codes[0].rawValue);
            else if (stream) animationFrame = requestAnimationFrame(scanFrame);
          }).catch(function () {
            stopCamera();
            status.textContent = 'Nie udało się odczytać kodu QR z kamery.';
          });
          return;
        }
        var image = context.getImageData(0, 0, canvas.width, canvas.height);
        var result = window.jsQR(image.data, image.width, image.height, {inversionAttempts: 'dontInvert'});
        if (result) {
          acceptPayload(result.data);
          return;
        }
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
      if (!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        status.textContent = 'Skanowanie wymaga bezpiecznego połączenia HTTPS i dostępu do kamery.';
        return;
      }
      if (!scannerDetector && !window.jsQR) {
        status.textContent = 'Nie udało się uruchomić skanera QR. Odśwież stronę i spróbuj ponownie.';
        return;
      }
      scanButton.disabled = true;
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
          scanButton.hidden = true;
          status.textContent = 'Skieruj kamerę na kod QR z paszportu.';
          return video.play();
        })
        .then(function () {
          if (stream) animationFrame = requestAnimationFrame(scanFrame);
        })
        .catch(function () {
          stopCamera();
          status.textContent = 'Brak dostępu do kamery. Zezwól na użycie kamery i spróbuj ponownie.';
        })
        .finally(function () {
          scanButton.disabled = false;
        });
    }

    qrButton.addEventListener('click', function () { setMode('qr'); });
    pinButton.addEventListener('click', function () { setMode('pin'); });
    scanButton.addEventListener('click', startCamera);
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
