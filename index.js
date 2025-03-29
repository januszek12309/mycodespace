const express = require('express');
require('dotenv').config({ path: './.env' });
const cors = require('cors');
const fbWebhookRoute = require('./routes/fbWebhookRoute'); // Importujesz tylko raz

const webApp = express();
webApp.use(cors());  // Używanie CORS

const PORT = process.env.PORT || 5000;

// Logowanie zapytań
webApp.use((req, res, next) => {
  console.log(`Received ${req.method} request at ${req.path}`);
  next();
});

webApp.use(express.urlencoded({ extended: true }));
webApp.use(express.json());

// Importujesz swoje trasy
const homeRoute = require('./routes/homeRoute');
const sendMessageRoute = require('./routes/sendMessageRoute');

// Ustawiasz trasy
webApp.use('/webhook', fbWebhookRoute.router);  // Endpoint do webhooka
webApp.use('/', homeRoute.router);              // Strona główna
webApp.use('/sendMessage', sendMessageRoute.router); // Endpoint do wysyłania wiadomości

// Uruchamiasz serwer
webApp.listen(PORT, () => {
  console.log(`Server is up and running at http://localhost:${PORT}`);
});
