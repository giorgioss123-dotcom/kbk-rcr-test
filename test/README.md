# frontend — setup

Statyczny frontend KBK: strony HTML, wspólny CSS i JavaScript. Logika biznesowa pozostaje w `public-backend`, `internal-scripts` i arkuszach.

## 1. Skonfiguruj źródła danych

1. Otwórz `public-config.js`.
2. W `KBK_APP_CONFIG.webAppUrl` wpisz URL wdrożonego publicznego Web App.
3. W `KBK_PUBLIC_SHEET_IDS` wpisz publiczne ID arkuszy `CENNIK`, `WNIOSKI` i `TRANSAKCJE`.
4. Upewnij się, że arkusze przeznaczone do odczytu publicznego nie zawierają danych wrażliwych.

Nie umieszczaj w tym katalogu PIN-ów, haseł, tokenów ani ID arkuszy prywatnych.

## 2. Uruchom lokalnie

Frontend nie wymaga buildu ani menedżera pakietów. Serwuj katalog repozytorium prostym serwerem HTTP, np.:

```text
py -m http.server 8000
```

Następnie otwórz `http://localhost:8000/frontend/`.

Nie otwieraj stron przez `file://`, ponieważ przeglądarka może zablokować żądania JSONP i zasoby zależne od ścieżki.

## 3. Sprawdź konfigurację

- `index.html` ładuje się bez błędów w konsoli;
- formularze rejestracji, logowania i głosowania wskazują właściwy Web App;
- dane `CENNIK`, `WNIOSKI` i `TRANSAKCJE` są widoczne tylko w zakresie przewidzianym dla użytkownika;
- działają widoki mobilne oraz linki do `confirm.html`;
- formularz rejestracji zapisuje telefon i wymaga zgody RODO z działającym linkiem do polityki prywatności;
- w konsoli nie ma błędów CORS, JSONP ani `404` dla plików CSS/JS.

## 4. Opublikuj

Opublikuj zawartość katalogu `frontend/` na wybranym hostingu statycznym. Po publikacji zaktualizuj `PUBLIC_SITE_URL` w projekcie `public-backend`, jeśli potwierdzenia mają kierować na `confirm.html` hostowanej strony.

Po zmianie `public-config.js` wyczyść cache przeglądarki lub zwiększ parametr wersji zasobów, jeśli hosting stosuje długi cache.
