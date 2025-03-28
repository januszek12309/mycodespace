// fbWebhookRoute.js

const express = require('express');
const router = express.Router();
require('dotenv').config();
const axios = require("axios").default;

// Endpoint weryfikacji (GET)
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);  // Wysłanie challenge
    } else {
      console.log('Invalid token');
      res.sendStatus(403);  // Forbidden, jeśli token nie pasuje
    }
  } else {
    console.log('Missing parameters');
    res.sendStatus(400);  // Missing parameters
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

    console.log("Otrzymano zapytanie POST:", body); // Zaloguj całe zapytanie

    if (!body.entry || !body.entry[0].messaging || !body.entry[0].messaging[0]) {
      return res.status(400).send('Invalid payload'); // Zwróć błąd, jeśli nie ma wymaganych danych
    }

    let senderId = body.entry[0].messaging[0].sender.id;
    let query = body.entry[0].messaging[0].message.text;

    console.log(`Otrzymano wiadomość: ${query} od użytkownika: ${senderId}`);

    const host = req.hostname;
    let requestUrl = `https://${host}/sendMessage`;
    await callSendMessage(requestUrl, senderId, query);

    res.status(200).send('OK');  // Potwierdzenie odbioru

  } catch (error) {
    console.error('Error in processing webhook:', error);
    res.status(500).send('Internal server error');  // Obsługa błędów
  }
});

module.exports = {
  router
};
