# frontend - setup

Statyczny frontend KBK: strony HTML, wspólny CSS i JavaScript. Logika biznesowa pozostaje w `public-backend`, `internal-scripts` i arkuszach.

## 1. Skonfiguruj źródła danych

Przy ręcznym uruchamianiu lub publikacji otwórz `public-config.js` i ustaw
`KBK_APP_CONFIG.webAppUrl` oraz publiczne ID arkuszy `CENNIK`, `WNIOSKI`, `TRANSAKCJE`
i `Tablica` (`tablicaFileId`) w `KBK_PUBLIC_SHEET_IDS`.

Przy wdrażaniu przez dispatcher nie edytuj `public-config.js`: plik jest generowany na nowo
z `publicConfig.webAppUrl` i `publicConfig.sheetIds` danego środowiska w
`tools/environments.local.json`. Wymagane są tam `cennikFileId`, `wnioskiFileId`,
`transakcjeFileId` i `tablicaFileId`.

Upewnij się, że arkusze przeznaczone do odczytu publicznego nie zawierają danych wrażliwych.

Nie umieszczaj w tym katalogu PIN-ów, haseł, tokenów ani ID arkuszy prywatnych.

Przy pierwszym uruchomieniu modułu Tablica uruchom jednorazowo `initializeTablica()` w
projekcie `public-backend`. Funkcja tworzy arkusz `Tablica`, zakładki i nagłówki, ustawia
publiczny odczyt oraz zapisuje jego ID w Script Properties jako `TABLICA_FILE_ID`. Następnie
skopiuj ID pliku do konfiguracji frontendu. Nie uruchamiaj inicjalizatora ponownie po ustawieniu
tej właściwości.

W już istniejącym pliku `Tablica` dodaj na końcu kolumnę `Przypięty` w zakładkach `Posty` i
`Ankiety`. Ustaw `NIE` przy dotychczasowych wpisach, a `TAK` przy tych, które mają być przypięte.
Nowe wpisy otrzymują `NIE` automatycznie.

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
- strona `konto.html` jest dostępna ze strefy społeczności i odwzorowuje przepływ rejestracji: lista operacji, osobny formularz dla każdej akcji oraz przycisk powrotu do listy; użytkownik podaje login, a zmiana PIN-u, danych kontaktowych/dobrowolnych zgód lub unieważnienie QR wymaga kliknięcia linku wysłanego na obecny adres e-mail konta;
- po potwierdzeniu aktualizacji profilu zmieniają się tylko dane kontaktowe i zgody dobrowolne; login, e-mail i obowiązkowa zgoda RODO pozostają bez zmian;
- po potwierdzeniu unieważnienia QR stary kod przestaje działać, a po nowy paszport użytkownik kontaktuje się z administracją;
- wnioski, głosowanie i ryneczek pozwalają wybrać logowanie PIN-em albo skanowanie QR paszportu kamerą (wymagane HTTPS i zgoda na kamerę);
- po odczytaniu QR kamera się wyłącza; ryneczek, głosowanie i składanie wniosku wysyłają wybraną operację od razu po skanie (głosowanie i wniosek nadal wymagają późniejszego potwierdzenia linkiem e-mailowym);
- przy nieznanym wyniku zamówienia ryneczek informuje o konieczności sprawdzenia poczekalni przez dyżurnego; formularz nie blokuje kolejnych prób, a każde ponowne wysłanie jest nowym zamówieniem;
- wnioski i głosy po niejednoznacznym wyniku jasno informują o możliwym zapisie, blokują ponowne wysłanie w tym formularzu i kierują do sprawdzenia poczty oraz folderu spam;
- szczegóły opublikowanych wniosków pokazują link do posta na Hive;
- karty wniosków pozwalają skopiować link do konkretnego wniosku; otwarcie linku automatycznie pokazuje jego szczegóły;
- strefa społeczności pokazuje w menu na pasku nawigacji aktywne wnioski, otwarte ankiety i posty z aktywnością w ostatnich 3 dniach; liczba przy dzwonku jest sumą tych wpisów, a w razie problemu z odczytem danych wyświetlany jest stan niedostępny zamiast fałszywego zera;
- Tablica odczytuje publiczne zakładki `Posty`, `Komentarze`, `Ankiety` i `Głosy`; publikowanie postów i komentarzy, dodawanie odpowiedzi do otwartych ankiet oraz głosowanie wymagają PIN-u lub kodu QR; opublikowanych postów i komentarzy nie można edytować;
- ankiety obsługują typy jednokrotnego i wielokrotnego wyboru, otwarte i zamknięte; ankietę otwartą można opublikować bez odpowiedzi, a zalogowani użytkownicy mogą dopisywać je przed terminem zamknięcia, do limitu 20;
- wpisy z wartością `TAK` w kolumnie `Przypięty` są wyświetlane nad pozostałymi, niezależnie od sortowania, z delikatnym oznaczeniem i separatorem;
- w konsoli nie ma błędów CORS, JSONP ani `404` dla plików CSS/JS.

Kod QR paszportu jest samodzielnym sekretem uwierzytelniającym do tych operacji. Każda osoba
posiadająca jego kopię może działać jako właściciel; nie należy udostępniać ani fotografować kodu.
Dekoder `jsQR` jest dołączony lokalnie w `js/vendor/`, a obraz z kamery jest przetwarzany w przeglądarce.

## 5. Opublikuj

Opublikuj zawartość katalogu `frontend/` na wybranym hostingu statycznym. Po publikacji zaktualizuj `PUBLIC_SITE_URL` w projekcie `public-backend`, jeśli potwierdzenia mają kierować na `confirm.html` hostowanej strony.

Po zmianie `public-config.js` wyczyść cache przeglądarki lub zwiększ parametr wersji zasobów, jeśli hosting stosuje długi cache.
