const express = require('express');
require('dotenv').config();

const webApp = express();

const PORT = process.env.PORT || 5000;

webApp.use(express.urlencoded({ extended: true }));
webApp.use(express.json());

// Importujesz swoje trasy
const homeRoute = require('./routes/homeRoute');
const fbWebhookRoute = require('./routes/fbWebhookRoute');
const sendMessageRoute = require('./routes/sendMessageRoute');

// Ustawiasz trasy
webApp.use('/webhook', fbWebhookRoute.router); // Endpoint do webhooka
webApp.use('/', homeRoute.router);              // Strona główna
webApp.use('/sendMessage', sendMessageRoute.router); // Endpoint do wysyłania wiadomości

// Uruchamiasz serwer
webApp.listen(PORT, () => {
  console.log(`Server is up and running at ${PORT}`);
});