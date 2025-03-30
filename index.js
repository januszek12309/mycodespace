const express = require('express');
require('dotenv').config({ path: './.env' });  // Ładowanie konfiguracji z pliku .env
console.log('VERIFY_TOKEN:', process.env.VERIFY_TOKEN);  // Sprawdzenie tokenu weryfikacji w logach

const cors = require('cors');
const fbWebhookRoute = require('./routes/fbWebhookRoute');  // Import webhooka

const webApp = express();
webApp.use(cors());  // Używanie CORS (dopuszcza połączenia z innych domen)

const PORT = process.env.PORT || 8080;  // Użyj portu z env lub 8080 jako domyślny

// Logowanie zapytań
webApp.use((req, res, next) => {
  console.log(`Received ${req.method} request at ${req.path}`);  // Zapisuje metodę i ścieżkę
  next();
});

// Middleware do przetwarzania danych w formacie URL-encoded i JSON
webApp.use(express.urlencoded({ extended: true }));
webApp.use(express.json());

// Importujesz trasy
const homeRoute = require('./routes/homeRoute');
const sendMessageRoute = require('./routes/sendMessageRoute');

// Ustawiasz trasy
webApp.use('/webhook', fbWebhookRoute.router);  // Endpoint do webhooka
webApp.use('/', homeRoute.router);              // Strona główna
webApp.use('/sendMessage', sendMessageRoute.router); // Endpoint do wysyłania wiadomości

// Uruchamiasz serwer
webApp.listen(PORT, () => {
  console.log(`Server is up and running at http://localhost:${PORT}`);  // Uruchomienie serwera
});
