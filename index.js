const express = require('express');
console.log('Before dotenv loading');
require('dotenv').config({ path: __dirname + '/.env' });
console.log('After dotenv loading');
console.log('VERIFY_TOKEN:', process.env.VERIFY_TOKEN); 
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY); 

const cors = require('cors');
const webApp = express();  // Inicjalizacja webApp po załadowaniu cors

// Użyj cors po zadeklarowaniu webApp
webApp.use(cors());

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