(function () {
  'use strict';

  const translations = {
    'KBK - Królestwo Bez Kresu': 'KBK - Kingdom Without Limit',
    'Królestwo Bez Kresu': 'Kingdom Without Limit',
    'KRÓLESTWO BEZ KRESU': 'KINGDOM WITHOUT LIMIT',
    'Królestwo': 'Kingdom',
    'Bez Kresu': 'Without Limit',
    'RCR - bilans': 'RCR - balances',
    'RCRT - bilans': 'RCRT - balances',
    'RCR - bilans społeczności · KBK': 'RCR - community balances · KBK',
    'RCRT - bilans społeczności · KBK': 'RCRT - community balances · KBK',
    'Pon - Sob  ·  16:00 - 23:00': 'Mon - Sat  ·  16:00 - 23:00',
    'KRÓLESTWO BEZ KRESU to otwarta enklawa przy Biskupiej 18 w Krakowie łącząca w sobie elementy centrum kultury, pracowni, kawiarni, muzeum, biblioteki, uczelni, coworkingu, domu Twojej babci i miejsca, którego prawdopodobnie zawsze Ci brakowało.': 'KINGDOM WITHOUT LIMIT is an open enclave at Biskupia 18 in Kraków, bringing together a cultural centre, studio, café, museum, library, university, coworking space, your grandmother’s home, and a place you may have always felt was missing.',
    'to otwarta enklawa przy Biskupiej 18 w Krakowie łącząca w sobie elementy centrum kultury, pracowni, kawiarni, muzeum, biblioteki, uczelni, coworkingu, domu Twojej babci i miejsca, którego prawdopodobnie zawsze Ci brakowało.': 'is an open enclave at Biskupia 18 in Kraków, bringing together a cultural centre, studio, café, museum, library, university, coworking space, your grandmother’s home, and a place you may have always felt was missing.',
    'Strefa społeczności - KBK': 'Community area - KBK',
    'Wnioski - KBK': 'Proposals - KBK',
    'Ryneczek - KBK': 'Marketplace - KBK',
    'RCR - bilans społeczności · KBK': 'RCR - community balances · KBK',
    'Potwierdzanie - KBK': 'Confirmation - KBK',
    'Rejestracja - KBK': 'Registration - KBK',
    '← główna KBK': '← Kingdom Without Limit home',
    '← strefa społeczności': '← community area',
    '← strona główna KBK': '← Kingdom Without Limit home',
    'Weryfikacja': 'Verification',
    'System KBK': 'KBK system',
    'Potwierdzanie': 'Confirmation',
    'Trwa weryfikacja Twojego linku potwierdzającego…': 'Verifying your confirmation link…',
    'Przetwarzanie': 'Processing',
    'Powrót na stronę główną': 'Back to home page',
    'Wróć': 'Back',
    'Rejestracja została potwierdzona. Możesz teraz korzystać z funkcji dla społeczności': 'Registration confirmed. You can now use community features.',
    'Link aktywacyjny jest nieprawidłowy lub wygasł.': 'The activation link is invalid or has expired.',
    'Konto lub adres e-mail są już zajęte.': 'The account or email address is already in use.',
    'Nie udało się potwierdzić rejestracji. Spróbuj ponownie później.': 'Could not confirm registration. Please try again later.',
    'Wniosek został potwierdzony.': 'The proposal has been confirmed.',
    'Link potwierdzający jest nieprawidłowy lub wygasł.': 'The confirmation link is invalid or has expired.',
    'Nie udało się potwierdzić wniosku. Spróbuj ponownie później.': 'Could not confirm the proposal. Please try again later.',
    'Głos został potwierdzony.': 'Your vote has been confirmed.',
    'Wniosek nie istnieje lub został usunięty.': 'The proposal does not exist or has been deleted.',
    'Czas głosowania już minął.': 'The voting period has ended.',
    'Nie udało się potwierdzić głosu. Spróbuj ponownie później.': 'Could not confirm your vote. Please try again later.',
    'PIN został zmieniony. Możesz się teraz zalogować.': 'Your PIN has been changed. You can now sign in.',
    'Link resetujący PIN jest nieprawidłowy lub wygasł.': 'The PIN reset link is invalid or has expired.',
    'Nie udało się potwierdzić danych konta.': 'Could not verify the account details.',
    'Nie udało się zmienić PIN-u. Spróbuj ponownie później.': 'Could not change the PIN. Please try again later.',
    'Operacja została potwierdzona.': 'The operation has been confirmed.',
    'Nie udało się potwierdzić operacji. Spróbuj ponownie później.': 'Could not confirm the operation. Please try again later.',
    'Potwierdzono': 'Confirmed',
    'Błąd': 'Error',
    'Link aktywacyjny jest nieprawidłowy.': 'The activation link is invalid.',
    'Nie udało się potwierdzić konta. Spróbuj ponownie później.': 'Could not confirm the account. Please try again later.',
    'Skanuj kod QR z paszportu': 'Scan QR code from passport',
    'Kod QR z paszportu': 'Passport QR code',
    'Kod QR': 'QR code',
    'Login i PIN': 'Username and PIN',
    'Sposób uwierzytelnienia': 'Authentication method',
    'Potwierdzam oddanie głosu za pomocą:': 'I confirm my vote using:',
    'Potwierdzam złożenie wniosku za pomocą:': 'I submit my proposal using:',
    'Zeskanuj kod QR, aby zagłosować': 'Scan QR to vote',
    'Zeskanuj kod QR i złóż wniosek': 'Scan QR and submit proposal',
    'Przyłóż paszport do kamery…': 'Hold your passport up to the camera…',
    'Potwierdzam transakcję za pomocą:': 'I confirm the transaction using:',
    'Zeskanuj kod QR i zamów': 'Scan QR code and order',
    'Wybierz produkt, aby zeskanować kod QR i złożyć zamówienie.': 'Choose a product to scan the QR code and place the order.',
    'Przyłóż paszport do kamery…': 'Hold your passport up to the camera…',
    'Ten kod QR nie jest prawidłowym kodem paszportu.': 'This is not a valid passport QR code.',
    'Kod QR odczytany': 'QR code scanned',
    'Skanowanie nie wysłało operacji. Sprawdź szczegóły i zatwierdź ją przyciskiem poniżej.': 'Scanning did not submit the action. Review the details and confirm it using the button below.',
    'Wybierz głos przed wysłaniem.': 'Choose a vote before submitting.',
    'Oczekiwanie na dostęp do kamery…': 'Waiting for camera access…',
    'Przytrzymaj kod QR z paszportu przed kamerą.': 'Hold your passport QR code in front of the camera.',
    'Nie udało się odczytać kodu QR z kamery.': 'Could not read a QR code from the camera.',
    'Skanowanie wymaga bezpiecznego połączenia HTTPS i dostępu do kamery.': 'Scanning requires a secure HTTPS connection and camera access.',
    'Nie udało się uruchomić skanera QR. Odśwież stronę i spróbuj ponownie.': 'Could not start the QR scanner. Refresh the page and try again.',
    'Brak dostępu do kamery. Zezwól na użycie kamery i spróbuj ponownie.': 'Camera access is unavailable. Allow camera access and try again.',
    'Wybierz metodę uwierzytelnienia i podaj wymagane dane.': 'Choose an authentication method and provide the required details.',
    'Nieprawidłowy kod QR.': 'Invalid QR code.',
    'Nie udało się uwierzytelnić kodu QR.': 'Could not authenticate the QR code.',
    'Nie udało się uwierzytelnić kodu QR z paszportu.': 'Could not authenticate the passport QR code.',
    'Wybierz metodę uwierzytelnienia, podaj wymagane dane i wybierz produkt.': 'Choose an authentication method, provide the required details, and select a product.',
    'Konto zablokowane. Zbyt wiele razy podano niepoprawny PIN. Czy chcesz teraz ustawić nowy?': 'Your account is locked because too many incorrect PINs were entered. Would you like to set a new one now?',
    'Wysłaliśmy link potwierdzający zmianę PINu. Kliknij go, aby zakończyć operację.': 'We have sent a confirmation link to change your PIN. Click it to complete the process.',
    'Podaj poprawny login.': 'Enter a valid username.',
    'PIN-y muszą być identyczne i składać się z 6 cyfr.': 'The PINs must match and contain 6 digits.',
    'Login lub e-mail nie zgadza się z danymi konta.': 'The username or email does not match the account details.',
    'Reset PINu jest dostępny po zablokowaniu konta.': 'PIN reset is available after the account has been locked.',
    'Nie udało się wysłać wiadomości. Spróbuj ponownie później.': 'Could not send the email. Please try again later.',
    'Nie udało się rozpocząć resetu PINu. Spróbuj ponownie później.': 'Could not start the PIN reset. Please try again later.',
    'Bezpieczeństwo konta': 'Account security',
    'Ustaw nowy PIN': 'Set a new PIN',
    'Podaj dane konta. Na podany adres e-mail wyślemy link potwierdzający.': 'Enter your account details. We will send a confirmation link to your email address.',
    'Nowy PIN': 'New PIN',
    'Potwierdź PIN': 'Confirm PIN',
    'Wyślij link potwierdzający': 'Send confirmation link',
    'Reset PINu': 'PIN reset',
    'Sprawdź e-mail': 'Check your email',
    'Wyślij': 'Submit',
    'TAK': 'YES',
    'NIE': 'NO',
    'Podaj poprawny login oraz dwa identyczne PIN-y składające się z 6 cyfr.': 'Enter a valid username and two matching 6-digit PINs.',
    'Wysyłanie wiadomości…': 'Sending email…',
    'Zgłoś problem / uwagi': 'Report an issue / feedback',
    'Zgłoś problem lub uwagi': 'Report an issue or feedback',
    'Rodzaj problemu': 'Issue type',
    'Brakująca funkcja': 'Missing feature',
    'Błąd lub coś nie działa': 'Bug or something is not working',
    'Pomysł na ulepszenie': 'Improvement idea',
    'Inna uwaga / pytanie': 'Other feedback / question',
    'Krótki opis': 'Short description',
    'Opisz problem, błąd lub pomysł…': 'Describe the issue, bug, or idea…',
    'Zgłaszający': 'Reporter',
    'Załącznik': 'Attachment',
    'Podgląd załącznika': 'Attachment preview',
    'Wybierz rodzaj problemu.': 'Choose an issue type.',
    'Opis zgłoszenia jest za krótki - minimum 10 znaków.': 'The description is too short - at least 10 characters are required.',
    'Podaj nazwę zgłaszającego.': 'Enter the reporter name.',
    'Dziękujemy. Zgłoszenie zostało wysłane.': 'Thank you. Your report has been submitted.',
    'Nie udało się wysłać zgłoszenia.': 'Could not submit the form.',
    'Nie udało się odczytać załącznika.': 'Could not read the attachment.',
    'Nie udało się odczytać pliku.': 'Could not read the file.',
    'Nieobsługiwany typ pliku. Wybierz PNG, JPG/JPEG lub WebP.': 'Unsupported file type. Choose PNG, JPG/JPEG, or WebP.',
    'Plik jest za duży. Maksymalnie 3 MB.': 'The file is too large. Maximum size is 3 MB.',
    'Nie udało się potwierdzić konta. Spróbuj ponownie później.': 'Could not confirm the account. Please try again later.',

    'Strefa społeczności': 'Community area',
    'Wymieniaj rycary na nagrody, sprawdzaj saldo i bierz udział w sprawach społeczności.': 'Exchange Ricars for rewards, check your balance, and take part in community matters.',
    'Utwórz konto rycarowe i potwierdź adres e-mail, aby dołączyć do systemu KBK.': 'Create a Ricar account and confirm your email address to join the KBK system.',
    'Załóż konto': 'Create an account',
    'Pozostałe narzędzia': 'Other tools',
    'Wnioski': 'Proposals',
    'Złóż wniosek, poznaj propozycje innych osób i zagłosuj w sprawach społeczności.': 'Submit a proposal, explore other people’s proposals, and vote on community matters.',
    'Złóż wniosek lub zagłosuj': 'Submit a proposal or vote',
    'Rejestracja': 'Registration',
    'Zarejestruj się, żeby stworzyć konto rycarowe i dołączyć do systemu KBK.': 'Register to create a Ricar account and join the KBK system.',
    'Zarejestruj się': 'Register',
    'Załóż konto': 'Create an account',
    'Ryneczek': 'Marketplace',
    'Wymień swoje rycary na nagrody dostępne w aktualnym katalogu.': 'Exchange your Ricars for rewards in the current catalogue.',
    'Otwórz ryneczek': 'Open marketplace',
    'Statystyki': 'Statistics',
    'Zobacz stan kont rycarowych i przejrzyj historię transakcji społeczności.': 'View Ricar account balances and browse the community transaction history.',
    'Zobacz statystyki': 'View statistics',

    'Przeglądaj, głosuj i składaj wnioski społeczności.': 'Browse, vote on, and submit community proposals.',
    'Złóż wniosek': 'Submit proposal',
    'Zamknij': 'Close',
    'Głosujesz nad wnioskiem': 'Vote on proposal',
    'Wybierz głos': 'Choose your vote',
    'Za': 'For',
    'Przeciw': 'Against',
    'Login': 'Username',
    'PIN': 'PIN',
    'Anuluj': 'Cancel',
    'Wyślij głos': 'Submit vote',
    'Wyślij głos: Za': 'Submit vote: For',
    'Wyślij głos: Przeciw': 'Submit vote: Against',
    'Zeskanuj kod QR i zagłosuj: Za': 'Scan QR to vote: For',
    'Zeskanuj kod QR i zagłosuj: Przeciw': 'Scan QR to vote: Against',
    'Nowy wniosek': 'New proposal',
    'Tytuł': 'Title',
    'Treść': 'Text',
    'Krótki, zwięzły tytuł': 'A short, concise title',
    'Treść wniosku': 'Proposal text',
    'Co dokładnie proponujesz?': 'What exactly are you proposing?',
    'Uzasadnienie': 'Justification',
    'Dlaczego to warto zrobić?': 'Why should this be done?',
    'Tytuł jest za krótki.': 'The title is too short.',
    'Głosujesz nad wnioskiem:': 'Vote on proposal:',
    'aktywny': 'active',
    'Aktywne': 'Active',
    'Archiwalne': 'Archived',
    'przyjęty': 'accepted',
    'Odrzucony': 'Rejected',
    'odrzucony': 'rejected',
    'Zagłosuj': 'Vote',
    'Pozostało:': 'Time left:',
    'Zakończono:': 'Ended:',
    'Zgłosił:': 'Submitted by:',
    'frekwencja:': 'turnout:',
    'aktywnych rycarów': 'active Ricars',
    'koniec:': 'ends:',
    'Zobacz listę głosów': 'View votes',
    'Brak potwierdzonych głosów.': 'No confirmed votes.',
    'Nie udało się wczytać listy głosów.': 'Could not load the vote list.',
    'zakończone': 'ended',
    'Nie udało się wczytać danych.': 'Could not load data.',
    'Brak aktywnych wniosków.': 'No active proposals.',
    'Brak archiwalnych wniosków.': 'No archived proposals.',
    'błąd wczytywania danych': 'Error loading data',
    'Wniosek został aktywowany i pojawił się na liście aktywnych. Dziękujemy!': 'The proposal is now active and appears in the active list. Thank you!',
    'Link jest nieprawidłowy albo wygasł. Złóż wniosek ponownie.': 'The link is invalid or has expired. Please submit the proposal again.',
    'Wystąpił błąd. Spróbuj ponownie później.': 'An error occurred. Please try again later.',
    'Nie udało się wysłać operacji. Nie została przyjęta; spróbuj ponownie.': 'The action could not be sent. It was not accepted; please try again.',
    'Twój głos został potwierdzony. Dziękujemy za udział!': 'Your vote has been confirmed. Thank you for taking part!',
    'Link jest nieprawidłowy albo wygasł. Oddaj głos ponownie.': 'The link is invalid or has expired. Please cast your vote again.',
    'Ten wniosek już nie istnieje.': 'This proposal no longer exists.',
    'Głosowanie na ten wniosek zostało już zakończone - Twój głos nie mógł zostać uwzględniony.': 'Voting on this proposal has ended; your vote could not be counted.',
    'Nie udało się potwierdzić operacji. Spróbuj ponownie później.': 'Could not confirm the operation. Please try again later.',
    'Nie udało się potwierdzić operacji. Spróbuj ponownie później.': 'Could not confirm the operation. Please try again later.',
    'Tytuł jest za krótki.': 'The title is too short.',
    'Treść wniosku jest za krótka.': 'The proposal text is too short.',
    'Uzasadnienie jest za krótkie.': 'The justification is too short.',
    'Nieprawidłowy login lub PIN.': 'Incorrect username or PIN.',
    'Nie udało się zweryfikować konta.': 'Could not verify the account.',
    'Potrzebujesz co najmniej 1 RCR salda, aby wykonać tę czynność.': 'You need a balance of at least 1 RCR to do this.',
    'Masz już wniosek oczekujący lub aktywny.': 'You already have a pending or active proposal.',
    'Masz już wniosek oczekujący lub aktywny. Jeśli składałeś go przed chwilą, sprawdź pocztę i folder spam.': 'You already have a pending or active proposal. If you just submitted it, check your inbox and spam folder.',
    'Masz już oczekujący głos na ten wniosek. Sprawdź pocztę i potwierdź go.': 'You already have a pending vote on this proposal. Check your email and confirm it.',
    'Głos na ten wniosek już oczekuje na potwierdzenie. Sprawdź pocztę i folder spam; nie wysyłaj go ponownie.': 'A vote on this proposal is already awaiting confirmation. Check your inbox and spam folder; do not submit it again.',
    'Nie możemy wysłać linku potwierdzającego, bo konto nie ma dostępnego adresu e-mail.': 'We cannot send a confirmation link because no email address is available for this account.',
    'To głosowanie nie jest już aktywne.': 'This vote is no longer active.',
    'Czas na głosowanie już minął.': 'The voting period has ended.',
    'Wybierz poprawny głos.': 'Choose a valid vote.',
    'Nie udało się wysłać wiadomości potwierdzającej. Spróbuj ponownie później.': 'Could not send the confirmation email. Please try again later.',
    'Nie udało się wysłać wiadomości potwierdzającej. Operacja nie została przyjęta; spróbuj ponownie później.': 'The confirmation email could not be sent. The action was not accepted; please try again later.',
    'Wynik jest nieznany. Operacja mogła zostać zapisana. Sprawdź pocztę i folder spam; nie wysyłaj ponownie.': 'The result is unknown. The action may have been saved. Check your inbox and spam folder; do not submit it again.',
    'Wystąpił błąd. Spróbuj ponownie później.': 'An error occurred. Please try again later.',
    'Nie udało się oddać głosu. Spróbuj ponownie później.': 'Could not submit your vote. Please try again later.',
    'Błąd połączenia. Spróbuj ponownie.': 'Connection error. Please try again.',
    'Głos zapisany - sprawdź maila, żeby go potwierdzić.': 'Vote saved - check your email to confirm it.',
    'Głos został wysłany do potwierdzenia. Sprawdź pocztę i folder spam.': 'Your vote was sent for confirmation. Check your inbox and spam folder.',
    'Wniosek został wysłany do potwierdzenia. Sprawdź pocztę i folder spam.': 'Your proposal was sent for confirmation. Check your inbox and spam folder.',
    'Nie znamy wyniku wysłania. Głos mógł zostać zapisany. Sprawdź pocztę i folder spam; nie wysyłaj go ponownie.': 'We cannot confirm the result. Your vote may have been saved. Check your inbox and spam folder; do not submit it again.',
    'Nie znamy wyniku wysłania. Wniosek mógł zostać zapisany. Sprawdź pocztę i folder spam; nie składaj go ponownie.': 'We cannot confirm the result. Your proposal may have been saved. Check your inbox and spam folder; do not submit it again.',
    'Nie znamy wyniku wysłania. Głos mógł zostać zapisany i czekać na potwierdzenie. Sprawdź pocztę i folder spam; nie wysyłaj go ponownie.': 'We cannot confirm the result. Your vote may have been saved and may be awaiting confirmation. Check your inbox and spam folder; do not submit it again.',
    'Nie znamy wyniku wysłania. Wniosek mógł zostać zapisany i czekać na potwierdzenie. Sprawdź pocztę i folder spam; nie składaj go ponownie.': 'We cannot confirm the result. Your proposal may have been saved and may be awaiting confirmation. Check your inbox and spam folder; do not submit it again.',
    'Sprawdź pocztę przed ponowieniem': 'Check your email before retrying',
    'Sprawdź e-mail': 'Check your email',
    'Nie udało się złożyć wniosku. Spróbuj ponownie później.': 'Could not submit the proposal. Please try again later.',
    'Nie udało się potwierdzić operacji. Spróbuj ponownie później.': 'Could not confirm the operation. Please try again later.',
    'Wysyłanie…': 'Sending…',
    'Wyślij głos': 'Submit vote',
    'Sprawdź listę głosów': 'View votes',

    'Wybierz produkty - zamówienie trafi do zatwierdzenia przez dyżurnego.': 'Choose products - your order will be sent to the attendant for approval.',
    'Chcę użyć rycarów:': 'I want to pay with:',
    'Wybór waluty płatności': 'Choose payment currency',
    'depozytowych (RCR)': 'deposit Ricars (RCR)',
    'transferowych (RCRT)': 'transfer Ricars (RCRT)',
    'Wyślij zamówienie': 'Submit order',
    'Ta przeglądarka nie może bezpiecznie utworzyć identyfikatora zamówienia.': 'This browser cannot safely create an order ID.',
    'Nie można bezpiecznie sprawdzić tego zamówienia. Skontaktuj się z dyżurnym.': 'This order cannot be checked safely. Contact the attendant.',
    'Nie udało się potwierdzić statusu zamówienia. Podejdź do dyżurnego, który sprawdzi, czy zamówienie trafiło do poczekalni. Jeśli go tam nie ma, możesz spróbować zamówić ponownie.': 'We could not confirm the order status. Please ask the attendant to check whether it reached the queue. If it is not there, you can try placing the order again.',
    'Brak aktywnych produktów w cenniku.': 'There are no active products in the catalogue.',
    'Nie udało się wczytać produktów.': 'Could not load products.',
    'Zmniejsz': 'Decrease',
    'Zwiększ': 'Increase',
    'Sprawdź login, PIN i wybrane produkty.': 'Check the username, PIN, and selected products.',
    'Nie udało się obliczyć wartości zamówienia.': 'Could not calculate the order total.',
    'Brak wystarczającego salda dla tego zamówienia.': 'Insufficient balance for this order.',
    'Nie udało się wysłać zamówienia. Spróbuj ponownie później.': 'Could not submit the order. Please try again later.',
    'Podaj login, 6-cyfrowy PIN i wybierz produkt.': 'Enter your username, 6-digit PIN, and choose a product.',
    'Przetwarzanie…': 'Processing…',
    'Wysyłanie zamówienia…': 'Sending order…',
    'Zamówienie przekazano do zatwierdzenia.': 'Your order has been sent for approval.',
    'Zamówienie zostało już przekazane do zatwierdzenia.': 'This order has already been sent for approval.',
    'Nie udało się zapisać zamówienia.': 'Could not save the order.',
    'Nie udało się połączyć z backendem.': 'Could not connect to the service.',

    'Wymagane:': 'Required:',
    'Wyrażam zgodę na przetwarzanie moich danych osobowych (imię, nazwisko, e-mail, adres, telefon) oraz kontakt w sprawach związanych z byciem członkiem społeczności Królestwa Bez Kresu.': 'I consent to the processing of my personal data (first name, last name, email, address, phone number) and to being contacted about my membership in the Kingdom Without Limit community.',
    'Polityka prywatności': 'Privacy policy',
    'Wyrażam zgodę na dopisanie do newslettera i otrzymywanie wiadomości na temat ważnych spraw dotyczących KBK drogą mailową.': 'I agree to subscribe to the newsletter and receive email updates about important Kingdom Without Limit matters.',
    'Chcę dołączyć do społeczności KBK na WhatsAppie (wymaga podania numeru telefonu).': 'I would like to join the KBK community on WhatsApp (a phone number is required).',
    'Chcę otrzymywać okazjonalne upminki dorgą pocztową lub odebrać w ten sposób paszport KBK (wymaga podania adresu do wysyłki).': 'I would like to receive occasional gifts by post or receive my KBK passport this way (a delivery address is required).',
    'Imię': 'First name',
    'Nazwisko': 'Last name',
    'opcjonalnie': 'optional',
    'E-mail': 'Email',
    'Adres': 'Address',
    'Numer telefonu': 'Phone number',
    'Załóż konto': 'Create an account',
    'Dołącz do systemu KBK - po weryfikacji mailowej konto zostanie aktywowane.': 'Join the KBK system - your account will be activated after email verification.',
    'Wybierz sposób dołączenia do nowego systemu rycarowego.': 'Choose how to join the new Ricar system.',
    'Weryfikacja konta': 'Account verification',
    'Podaj nam swoją nazwę użytkownika i email, żebyśmy mogli zweryfikować Twoją tożsamość.': 'Enter your username and email so we can verify your identity.',
    'Mam już konto rycarowe i chcę zarejestrować się w nowym systemie': 'I already have a Ricar account and want to register in the new system',
    'Chcę utworzyć nowe konto rycarowe': 'I want to create a new Ricar account',
    'Nazwa użytkownika': 'Username',
    'Podaj nam swoją nazwę użytkownika i email, żebyśmy mogli zweryfikować Twoją tożsamość': 'Enter your username and email so we can verify your identity.',
    'Zatwierdź': 'Submit',
    'powtórz PIN': 'repeat PIN',
    'PIN (6 cyfr)': 'PIN (6 digits)',
    'Zarejestruj się': 'Register',
    'Zaakceptuj obowiązkową zgodę na przetwarzanie danych osobowych.': 'Please accept the required consent to the processing of personal data.',
    'Aby założyć konto, zaakceptuj obowiązkową zgodę na przetwarzanie danych osobowych.': 'To create an account, please accept the required consent to the processing of personal data.',
    'Podaj poprawną nazwę użytkownika.': 'Enter a valid username.',
    'Podaj poprawny adres e-mail.': 'Enter a valid email address.',
    'PIN musi składać się z dokładnie 6 cyfr.': 'The PIN must contain exactly 6 digits.',
    'Aby wyrazić zgodę na kontakt WhatsApp, podaj numer telefonu.': 'Enter a phone number to consent to WhatsApp contact.',
    'Aby wyrazić zgodę na kontakt pocztowy, podaj adres.': 'Enter an address to consent to postal contact.',
    'Ten login jest już zajęty. Wybierz inny.': 'This username is already taken. Choose another.',
    'Ten adres e-mail jest już zarejestrowany.': 'This email address is already registered.',
    'Formularz został wysłany zbyt szybko. Odczekaj chwilę i spróbuj ponownie.': 'The form was submitted too quickly. Wait a moment and try again.',
    'Nie udało się wysłać wiadomości aktywacyjnej. Spróbuj ponownie później.': 'Could not send the activation email. Please try again later.',
    'Wystąpił błąd podczas rejestracji. Spróbuj ponownie później.': 'An error occurred during registration. Please try again later.',
    'Podany użytkownik nie istnieje. Stwórz nowe konto wybierając opcję "Chcę utworzyć nowe konto rycarowe".': 'This username does not exist. Create a new account by choosing “I want to create a new Ricar account”.',
    'Podany adres e-mail nie zgadza się z adresem zapisanym dla tego użytkownika.': 'The email address does not match the one registered for this user.',
    'Podany adres e-mail nie zgadza się z danymi zatwierdzonymi dla tego loginu.': 'The email address does not match the details approved for this username.',
    'Zweryfikujemy Twoje dane, a następnie skontaktujemy się z Tobą mailowo. W razie wątpliwości napisz do nas lub przyjdź zapytać do Królestwa.': 'We will verify your details and then contact you by email. If you have any questions, write to us or visit the Kingdom.',
    'To konto jest już w trakcie weryfikacji. Skontaktujemy się z Tobą, kiedy będzie ona zakończona. W razie wątpliwości napisz do nas lub przyjdź zapytać do Królestwa.': 'This account is already being verified. We will contact you when verification is complete. If you have any questions, write to us or visit the Kingdom.',
    'Twoja nazwa użytkownika i email zostały już pomyślnie zweryfikowane. Wybierz teraz opcję "Chcę utworzyć nowe konto rycarowe", załóż konto podając obecną nazwę użytkownika i email, a uzyskasz dostęp do swoich rycarów': 'Your username and email have already been verified. Choose “I want to create a new Ricar account” and register using your current username and email to access your Ricars.',
    'Nie udało się sprawdzić dostępności loginu. Spróbuj ponownie później.': 'Could not check username availability. Please try again later.',
    'Podana nazwa użytkownika jest już zajęta': 'This username is already taken.',
    'Nazwa użytkownika jest dostępna': 'This username is available.',
    'Piny nie są identyczne.': 'The PINs do not match.',
    'Aby wyrazić zgodę na kontakt pocztowy, podaj adres do wysyłki.': 'Enter a mailing address to consent to postal contact.',
    'Wysłano zapytanie o aktywację konta. Sprawdź skrzynkę mailową, by potwierdzić rejestrację.': 'An account activation email has been sent. Check your inbox to confirm your registration.',
    'Nie udało się odczytać odpowiedzi serwera. Sprawdź pocztę: jeśli otrzymałeś link aktywacyjny, rejestracja jest w toku i nie wysyłaj formularza ponownie. Jeśli wiadomość nie dotrze, spróbuj ponownie za kilka minut.': 'Could not read the server response. Check your email: if you received an activation link, registration is in progress and you should not submit the form again. If the email does not arrive, try again in a few minutes.',
    'Weryfikacja konta': 'Account verification',
    'Sprawdź dostępność': 'Check availability',
    'Dlaczego podać e-mail?': 'Why provide an email?',
    'E-mail jest potrzebny do potwierdzenia rejestracji i kontaktu w sprawach konta.': 'Your email is needed to confirm registration and contact you about your account.',
    'Aby wyrazić zgodę na kontakt WhatsApp, podaj numer telefonu.': 'Enter a phone number to consent to WhatsApp contact.',
    'Aby wyrazić zgodę na kontakt pocztowy, podaj adres do wysyłki.': 'Enter a mailing address to consent to postal contact.',
    'Dlaczego podać adres?': 'Why provide an address?',
    'Adres może ułatwić kontakt pocztowy i organizację spraw związanych ze społecznością.': 'Your address may help us contact you by post and coordinate community matters.',
    'Dlaczego podać numer telefonu?': 'Why provide a phone number?',
    'Telefon może ułatwić szybki kontakt w ważnych sprawach dotyczących społeczności.': 'A phone number can help us contact you quickly about important community matters.',
    'Ktoś zdążył zarejestrować ten login lub e-mail przed Tobą. Spróbuj ponownie z innymi danymi.': 'Someone has already registered this username or email address. Please try again with different details.',
    'Link jest nieprawidłowy albo wygasł. Zarejestruj się ponownie.': 'The link is invalid or has expired. Please register again.',
    'Sprawdzanie...': 'Checking…',
    'Wysyłanie…': 'Sending…',
    'Podane dane (imię, nazwisko, e-mail, opcjonalnie adres i telefon) są przetwarzane wyłącznie w celu założenia i obsługi konta w systemie. Zgody na kontakt e-mailowy/pocztowy są dobrowolne i możesz je wycofać w dowolnym momencie, kontaktując się z nami.': 'The data you provide (first name, last name, email, and optionally address and phone number) is processed solely to create and manage your account. Consent to email or postal contact is voluntary and can be withdrawn at any time by contacting us.',

    'RCR - bilans': 'RCR - balances',
    'Ranking posiadaczy RCR i siły głosu. Kliknij w osobę, żeby zobaczyć jej transakcje.': 'RCR holder and voting power ranking. Select a person to view their transactions.',
    'Ranking posiadaczy RCRT. Kliknij w osobę, żeby zobaczyć jej transakcje.': 'RCRT holder ranking. Select a person to view their transactions.',
    'Chcę widzieć rycary:': 'Show me:',
    'Wybór rodzaju rycarów': 'Choose currency type',
    'depozytowe (RCR)': 'deposit Ricars (RCR)',
    'transferowe (RCRT)': 'transfer Ricars (RCRT)',
    'Szukaj po loginie…': 'Search by username…',
    'pokaż nieaktywne': 'show inactive',
    'łączenie…': 'connecting…',
    'transakcje': 'transactions',
    'saldo RCR': 'RCR balance',
    'saldo RCRT': 'RCRT balance',
    'siła głosu': 'voting power',
    'liczba transakcji': 'number of transactions',
    'Wszystkie transakcje': 'All transactions',
    'wczytywanie…': 'loading…',
    'uczestników': 'participants',
    'aktywnych': 'active users',
    'Brak wyników dla podanego loginu.': 'No results for this username.',
    'nieaktywny': 'inactive',
    'Brak zarejestrowanych transakcji.': 'No transactions found.',
    'Wczytywanie transakcji archiwalnych…': 'Loading archived transactions…',
    'Bilans': 'Balance',
    'Historia transakcji': 'Transaction history',
    'Za mało danych, by pokazać wykres.': 'Not enough data to display a chart.',
    'Podsumowanie wg tytułu': 'Summary by title',
    'zsynchronizowano': 'synced',
    'błąd połączenia': 'connection error',
    'Nie udało się pobrać danych. Spróbuj ponownie później.': 'Could not load data. Please try again later.',
    'Spróbuj ponownie': 'Try again',

    'Otwarta enklawa': 'Open enclave',
    'Godło Królestwa Bez Kresu': 'Kingdom Without Limit emblem',
    'Wydarzenia': 'Events',
    'Dziennik': 'Journal',
    'Dla społeczności': 'Community',
    'Konstytucja': 'Constitution',
    'Czytaj →': 'Read →',
    'Nie udało się załadować wpisów. Zobacz dziennik na': 'Could not load posts. Read the journal on',
    'Mapa - Królestwo Bez Kresu, Biskupia 18, Kraków': 'Map - Kingdom Without Limit, Biskupia 18, Kraków',
    'Kontakt': 'Contact',
    'Mapa': 'Map',
    'Otwarta enklawa · Biskupia 18 · Kraków': 'Open enclave · Biskupia 18 · Kraków',
    'Otwarta enklawa · Kraków': 'Open enclave · Kraków',
    'Wrota otwarte': 'Open hours',
    'Pon - Sob': 'Mon - Sat',
    'Wstęp wolny': 'Free entry',
    'Godziny otwarcia': 'Opening hours',
    'Frekwencja odwiedzających': 'Visitor attendance',
    'W tym miesiącu odwiedziło nas już:': 'Visitors this month:',
    'Od początku roku odwiedziło nas:': 'Visitors this year:',
    'osób': 'people',
    'Otwórz kalendarz': 'Open calendar',
    'Kalendarz KBK': 'KBK calendar',
    'Wszystkie nadchodzące wydarzenia': 'All upcoming events',
    'Coworking, wieczory poezji, book club, spotkania filozoficzne i wiele innych - pełen harmonogram znajdziesz w naszym kalendarzu na Luma.': 'Coworking, poetry evenings, book club, philosophical discussions, and much more - find the full schedule in our Luma calendar.',
    'Czytaj na PeakD': 'Read on PeakD',
    'Wejdź do strefy społeczności': 'Visit the community area',
    'Zobacz pełny tekst': 'Read the full text',
    'Ładowanie Konstytucji…': 'Loading the Constitution…',
    'Gdzie nas znaleźć': 'Where to find us',
    'Królestwo Bez Kresu': 'Kingdom Without Limit',
    'KRÓLESTWO BEZ KRESU': 'KINGDOM WITHOUT LIMIT',
    'Wrota otwarte': 'Open hours',
    'Wszystkie nadchodzące wydarzenia': 'All upcoming events',
    'Wejdź do strefy społeczności': 'Visit the community area',
    'Pełen harmonogram znajdziesz w naszym kalendarzu na Luma.': 'Find the full schedule in our Luma calendar.',
    'Napisz do nas': 'Contact us',
    'Śledź nas': 'Follow us',
    'Jak do nas dotrzeć': 'How to get here',
    'Nawiguj': 'Get directions',
    'Otwarta enklawa przy Biskupiej 18 w Krakowie. Centrum kultury, pracownia, kawiarnia, muzeum, biblioteka, uczelnia, coworking i dom Twojej babci - w jednym.': 'An open enclave at Biskupia 18 in Kraków. A cultural centre, studio, café, museum, library, university, coworking space, and your grandmother’s home - all in one.',
    'Poniedziałek - Sobota': 'Monday - Saturday',
    'Niedziela: zamknięte': 'Sunday: closed',
    'Luma (wydarzenia)': 'Luma (events)',
    'Nawigacja': 'Navigation',
    'Znajdź nas': 'Find us',
    'Wsparcie:': 'Support:',
    'Biskupia 18': 'Biskupia 18',
    'Ładowanie najnowszych wpisów…': 'Loading the latest posts…',
    'Menu': 'Menu',
    'MENU': 'MENU',
    'Główna': 'Home',
    'Adres': 'Address',
    'Otwórz w mapach': 'Open in maps',
    'Pokaż mapę': 'Show map',
    'Godziny otwarcia': 'Opening hours',
    'ADRES': 'ADDRESS',
    'GODZINY': 'HOURS',
    'KONTAKT': 'CONTACT',
    'MEDIA': 'MEDIA',
    '- ADRES': '- ADDRESS',
    '- GODZINY': '- HOURS',
    '- KONTAKT': '- CONTACT',
    '- MEDIA': '- MEDIA',
    'Luma (wydarzenia) →': 'Luma (events) →',
    'Królestwo Bez Kresu · Fundacja Tradycji Miast i Wsi': 'Kingdom Without Limit · Foundation of City and Village Traditions',
    'FUNDACJA TRADYCJI MIAST I WSI': 'FOUNDATION OF CITY AND VILLAGE TRADITIONS',
    'pon.–sob. 16:00 - 23:00': 'Mon–Sat 16:00 - 23:00',

    'Chcę użyć rycarów:': 'I want to use:',
    'depozytowych (RCR)': 'deposit Ricars (RCR)',
    'transferowych (RCRT)': 'transfer Ricars (RCRT)',
    'Nieaktywne konto': 'Inactive account',
    'AKTYWNYCH': 'ACTIVE',
    'Wybierz rodzaj rycarów': 'Choose currency type',
    'Zobacz transakcje:': 'View transactions:',
    'Dane podane w formularzu (imię, nazwisko, e-mail oraz opcjonalnie adres i telefon) są przetwarzane wyłącznie w celu założenia i obsługi konta. Zgoda na kontakt e-mailowy lub pocztowy jest dobrowolna i może zostać wycofana w dowolnym momencie, kontaktując się z nami.': 'The information provided (first name, last name, email, and optionally address and phone number) is processed solely to create and manage your account. Consent to email or postal contact is voluntary and can be withdrawn at any time by contacting us.',
    'ulica, miasto, kod pocztowy': 'street, city, postal code',
    '(opcjonalnie)': '(optional)',
    'FREKWENCJA:': 'VOTER TURNOUT:',
    'AKTYWNYCH RYCARÓW': 'ACTIVE RICARS',
    'FREKWENCJA': 'VOTER TURNOUT',
    'POKAŻ NIEAKTYWNE': 'SHOW INACTIVE',
    'Nie udało się pobrać danych. Spróbuj ponownie później.': 'Could not load data. Please try again later.'
  };

  const reverseTranslations = {};
  Object.keys(translations).forEach(function (source) {
    if (!Object.prototype.hasOwnProperty.call(reverseTranslations, translations[source])) {
      reverseTranslations[translations[source]] = source;
    }
  });
  function normalizeText(value) {
    return value.trim().replace(/\s+/g, ' ');
  }

  function normalizeMap(map) {
    const normalized = {};
    Object.keys(map).forEach(function (key) {
      normalized[normalizeText(key)] = map[key];
    });
    return normalized;
  }
  const normalizedTranslations = normalizeMap(translations);
  const normalizedReverseTranslations = normalizeMap(reverseTranslations);

  const params = new URLSearchParams(window.location.search);
  const language = params.get('lang') === 'en' ? 'en' : 'pl';
  const editableContent = 'input, textarea, select, [contenteditable="true"]';

  function translateValue(value) {
    const map = language === 'en' ? normalizedTranslations : normalizedReverseTranslations;
    const trimmed = value.trim();
    const normalized = normalizeText(value);
    if (!normalized) return value;
    if (Object.prototype.hasOwnProperty.call(map, normalized)) return value.replace(trimmed, map[normalized]);
    if (language === 'en' && /^\d+\s+aktywnych$/i.test(normalized)) return value.replace(/aktywnych/i, 'active users');
    if (language === 'pl' && /^\d+\s+active users$/i.test(normalized)) return value.replace(/active users/i, 'aktywnych');
    const prefixes = language === 'en'
      ? [['Zgłosił:', 'Submitted by:'], ['Pozostało do zakończenia:', 'Time remaining:'], ['Zakończono:', 'Ended:'], ['zsynchronizowano', 'synced'], ['Głosujesz nad wnioskiem:', 'Vote on proposal:'], ['FREKWENCJA:', 'VOTER TURNOUT:'], ['Zobacz transakcje:', 'View transactions:'], ['Suma zamówienia:', 'Order total:'], ['Sprawdzenie tego samego zamówienia:', 'Checking the same order:'], ['Zamówienie za', 'Order for'], ['Zamów za', 'Order for'], ['Zeskanuj kod QR i zamów za', 'Scan QR code and order for'], ['Zeskanuj QR i zagłosuj:', 'Scan QR to vote:'], ['Zeskanuj QR i złóż wniosek:', 'Scan QR and submit proposal:'], ['Wyślij głos:', 'Submit vote:'], ['Twój głos:', 'Your vote:'], ['Wniosek:', 'Proposal:'], ['za ', 'for '], ['przeciw ', 'against ']]
      : [['Submitted by:', 'Zgłosił:'], ['Time remaining:', 'Pozostało do zakończenia:'], ['Ended:', 'Zakończono:'], ['synced', 'zsynchronizowano'], ['Vote on proposal:', 'Głosujesz nad wnioskiem:'], ['VOTER TURNOUT:', 'FREKWENCJA:'], ['View transactions:', 'Zobacz transakcje:'], ['Order total:', 'Suma zamówienia:'], ['Checking the same order:', 'Sprawdzenie tego samego zamówienia:'], ['Order for', 'Zamówienie za'], ['Submit vote:', 'Wyślij głos:'], ['Your vote:', 'Twój głos:'], ['Proposal:', 'Wniosek:'], ['Scan QR code and order for', 'Zeskanuj kod QR i zamów za'], ['Scan QR to vote:', 'Zeskanuj QR i zagłosuj:'], ['Scan QR and submit proposal:', 'Zeskanuj QR i złóż wniosek:'], ['for ', 'za '], ['against ', 'przeciw ']];
    const prefix = prefixes.find(function (entry) {
      const sourcePrefix = normalizeText(entry[0]);
      return normalized.toLowerCase().indexOf(sourcePrefix.toLowerCase() + ' ') === 0
        || normalized.toLowerCase() === sourcePrefix.toLowerCase();
    });
    if (!prefix) return value;
    const sourcePrefix = normalizeText(prefix[0]);
    const translatedPrefix = prefix[1];
    let suffix = normalized.slice(sourcePrefix.length);
    if (language === 'en' && prefix[0] === 'FREKWENCJA:') suffix = suffix.replace(/aktywnych rycarów/gi, 'active Ricars');
    if (language === 'pl' && prefix[0] === 'VOTER TURNOUT:') suffix = suffix.replace(/active Ricars/gi, 'aktywnych rycarów');
    return value.replace(trimmed, translatedPrefix + suffix);
  }

  function isExcluded(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    if (parent.closest('script, style, noscript')) return true;
    if (parent.closest('option')) return false;
    if (parent.closest(editableContent)) return true;
    if (parent.closest('#constitution-full-text')) return true;
    const constitutionContent = parent.closest('#konstytucja-content');
    if (constitutionContent && !parent.closest('.constitution-link')) return true;
    if (parent.closest('.journal-title, .journal-excerpt, .card-title, .card-excerpt, .tx-title, .cat-title, .catalogue-product-title, #drawerLogin, #detailTitle, #detailText, #detailJustification')) return true;
    return false;
  }

  function translateTextNode(node) {
    if (isExcluded(node)) return;
    const value = node.nodeValue;
    const translated = translateValue(value);
    if (translated !== value) node.nodeValue = translated;
  }

  function translateAttribute(element, name) {
    const value = element.getAttribute(name);
    if (!value) return;
    const translated = translateValue(value);
    if (translated !== value) element.setAttribute(name, translated);
  }

  function isExcludedElement(element) {
    if (element.closest('#constitution-full-text')) return true;
    const constitutionContent = element.closest('#konstytucja-content');
    if (constitutionContent && !element.closest('.constitution-link')) return true;
    return element.matches('.journal-title, .journal-excerpt, .card-title, .card-excerpt, .tx-title, .cat-title, .catalogue-product-title, #drawerLogin, #detailTitle, #detailText, #detailJustification');
  }

  function translateAttributes(element) {
    if (isExcludedElement(element) || element.matches('.kbk-language-switch')) return;
    ['title', 'placeholder', 'aria-label', 'alt', 'data-info'].forEach(function (name) {
      if (element.hasAttribute(name)) translateAttribute(element, name);
    });
  }

  function translateNode(root) {
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root !== document) return;
    const element = root.nodeType === Node.ELEMENT_NODE ? root : document.documentElement;
    if (element.matches && element.matches(editableContent)) {
      translateAttributes(element);
      if (element.matches('select')) {
        element.querySelectorAll('option').forEach(function (option) {
          Array.from(option.childNodes).forEach(function (child) {
            if (child.nodeType === Node.TEXT_NODE) translateTextNode(child);
          });
        });
      }
      return;
    }
    if (element.matches && element.matches('#constitution-full-text')) return;
    if (element.matches && element.matches('#konstytucja-content') && language === 'en') {
      const button = element.querySelector('.constitution-link');
      if (button) translateNode(button);
      return;
    }
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    if (root !== document) translateAttributes(element);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
      else translateAttributes(node);
    }
  }

  function addLanguageSwitch() {
    const navInner = document.querySelector('.nav-inner');
    if (!navInner) return;
    const switchLink = document.createElement('a');
    switchLink.className = 'kbk-language-switch';
    switchLink.href = '#';
    switchLink.textContent = language === 'en' ? 'PL' : 'EN';
    switchLink.setAttribute('aria-label', language === 'en' ? 'Switch to Polish' : 'Przełącz na angielski');
    switchLink.addEventListener('click', function (event) {
      event.preventDefault();
      const next = new URL(window.location.href);
      next.searchParams.set('lang', language === 'en' ? 'pl' : 'en');
      window.location.href = next.toString();
    });

    const style = document.createElement('style');
    style.textContent = '.kbk-language-switch{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;margin-left:auto;padding:8px 12px;border:1px solid rgba(255,255,255,.32);color:rgba(255,255,255,.82);font:500 .72rem "IBM Plex Mono",monospace;letter-spacing:.14em;text-decoration:none;white-space:nowrap;transition:background .18s,color .18s}.kbk-language-switch:hover{background:#fff;color:#0c3038}@media(max-width:480px){.kbk-language-switch{padding:7px 9px;font-size:.64rem}}';
    document.head.appendChild(style);

    const brand = navInner.querySelector('.nav-brand');
    const navToggle = navInner.querySelector('.nav-toggle');
    if (navToggle) navInner.insertBefore(switchLink, navToggle);
    else if (brand && brand.nextSibling) navInner.insertBefore(switchLink, brand.nextSibling);
    else navInner.appendChild(switchLink);
  }

  function preserveLanguageInLinks() {
    document.querySelectorAll('a[href]').forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
      let target;
      try {
        target = new URL(href, window.location.href);
      } catch (error) {
        return;
      }
      if (target.origin !== window.location.origin || !/\.html$/i.test(target.pathname)) return;
      target.searchParams.set('lang', language);
      link.setAttribute('href', target.pathname + target.search + target.hash);
    });
  }

  document.documentElement.lang = language;
  addLanguageSwitch();
  translateNode(document);
  preserveLanguageInLinks();

  const observer = new MutationObserver(function (records) {
    records.forEach(function (record) {
      if (record.type === 'characterData') {
        translateTextNode(record.target);
        return;
      }
      if (record.type === 'attributes') {
        translateAttribute(record.target, record.attributeName);
        return;
      }
      record.addedNodes.forEach(translateNode);
    });
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['title', 'placeholder', 'aria-label', 'alt', 'data-info']
  });
})();
