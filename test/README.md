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

## 3. Wersja angielska

Otwórz publiczną stronę z parametrem `?lang=en`, np. `http://localhost:8000/frontend/index.html?lang=en`. Przełącznik w nawigacji zmienia język i zachowuje go podczas przechodzenia między widokami. Domyślnie używany jest język polski (`?lang=pl`).

Tekst Konstytucji oraz jej preambuła pozostają po polsku również w wersji angielskiej.

## 4. Sprawdź konfigurację

- `index.html` ładuje się bez błędów w konsoli;
- formularze rejestracji, logowania i głosowania wskazują właściwy Web App;
- dane `CENNIK`, `WNIOSKI` i `TRANSAKCJE` są widoczne tylko w zakresie przewidzianym dla użytkownika;
- działają widoki mobilne oraz linki do `confirm.html`;
- formularz rejestracji zapisuje telefon i wymaga zgody RODO z działającym linkiem do polityki prywatności;
- wnioski, głosowanie i ryneczek pozwalają wybrać logowanie PIN-em albo skanowanie QR paszportu kamerą (wymagane HTTPS i zgoda na kamerę);
- po odczytaniu QR kamera się wyłącza; ryneczek, głosowanie i składanie wniosku wysyłają wybraną operację od razu po skanie (głosowanie i wniosek nadal wymagają późniejszego potwierdzenia linkiem e-mailowym);
- przy nieznanym wyniku zamówienia ryneczek informuje o konieczności sprawdzenia poczekalni przez dyżurnego; formularz nie blokuje kolejnych prób, a każde nowe wysłanie dostaje nowy identyfikator, podczas gdy backend zachowuje idempotencję dla powtórzeń tego samego żądania;
- wnioski i głosy po niejednoznacznym wyniku jasno informują o możliwym zapisie, blokują ponowne wysłanie w tym formularzu i kierują do sprawdzenia poczty oraz folderu spam;
- w konsoli nie ma błędów CORS, JSONP ani `404` dla plików CSS/JS.

Kod QR paszportu jest samodzielnym sekretem uwierzytelniającym do tych operacji. Każda osoba
posiadająca jego kopię może działać jako właściciel; nie należy udostępniać ani fotografować kodu.
Dekoder `jsQR` jest dołączony lokalnie w `js/vendor/`, a obraz z kamery jest przetwarzany w przeglądarce.

## 5. Opublikuj

Opublikuj zawartość katalogu `frontend/` na wybranym hostingu statycznym. Po publikacji zaktualizuj `PUBLIC_SITE_URL` w projekcie `public-backend`, jeśli potwierdzenia mają kierować na `confirm.html` hostowanej strony.

Po zmianie `public-config.js` wyczyść cache przeglądarki lub zwiększ parametr wersji zasobów, jeśli hosting stosuje długi cache.
