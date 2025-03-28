// fbWebhookRoute.js

const express = require('express');
const router = express.Router();
require('dotenv').config();
const axios = require("axios").default;

// Endpoint weryfikacji (GET)
router.get('/', (req, res) => {
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  if (mode && token) {
    // Sprawdzamy, czy token w zapytaniu pasuje do tokenu w .env
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);  // Odpowiadamy challenge z zapytania
    } else {
      res.sendStatus(403);  // Jeśli token nie pasuje
    }
  } else {
    res.sendStatus(400);  // Brak wymaganych parametrów
  }
});

// Funkcja do wysyłania wiadomości
const callSendMessage = async (url, senderId, query) => {
  const options = {
    method: 'POST',
    url: url,
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      senderId: senderId,
      query: query
    }
  };
  await axios.request(options);  // Wykonanie żądania
}

// Endpoint do przetwarzania powiadomień (POST)
router.post('/', async (req, res) => {
  try {
    let body = req.body;
    
    // Sprawdzamy, czy zapytanie ma odpowiednią strukturę
    if (!body.entry || !body.entry[0].messaging || !body.entry[0].messaging[0]) {
      return res.status(400).send('Invalid payload');
    }

    // Pobieramy dane z ciała zapytania
    let senderId = body.entry[0].messaging[0].sender.id;
    let query = body.entry[0].messaging[0].message.text;

    // Przygotowujemy adres URL do wysyłania wiadomości
    const host = req.hostname;
    let requestUrl = `https://${host}/sendMessage`;

    // Wywołujemy funkcję wysyłania wiadomości
    await callSendMessage(requestUrl, senderId, query);

    console.log(senderId, query);  // Logowanie odbiorcy i zapytania

    res.status(200).send('OK');  // Potwierdzenie odbioru
  } catch (error) {
    console.error('Error in processing webhook:', error);
    res.status(500).send('Internal server error');  // Obsługa błędów
  }
});

module.exports = {
  router
};
