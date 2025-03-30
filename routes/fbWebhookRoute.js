const express = require('express');
const router = express.Router();
require('dotenv').config();
const axios = require("axios").default;

// Endpoint weryfikacji (GET)
// Endpoint weryfikacji (GET)
router.get('/', (req, res) => {
  console.log('📥 Otrzymano żądanie GET:', req.query); // Loguj całą zawartość zapytania

  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  console.log(`🔹 mode: ${mode}, token: ${token}, challenge: ${challenge}`);

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      console.log('✅ WEBHOOK_VERIFIED');
      res.status(200).send(challenge);  // Odpowiedź na wyzwanie
    } else {
      console.log(`❌ Invalid token or mode - otrzymano token: ${token}, a oczekiwano: ${process.env.VERIFY_TOKEN}`);
      res.sendStatus(403);  // Jeśli token lub tryb są nieprawidłowe
    }
  } else {
    console.log('⚠️ Missing parameters');
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
  console.log('📥 Otrzymano żądanie POST:', JSON.stringify(req.body, null, 2)); // Loguje pełne body

  try {
    let body = req.body;

    if (!body.entry || !body.entry[0].messaging || !body.entry[0].messaging[0]) {
      console.log('⚠️ Nieprawidłowe dane w body:', body);
      return res.status(400).send('Invalid payload'); 
    }

    let senderId = body.entry[0].messaging[0].sender.id;
    let query = body.entry[0].messaging[0].message.text;

    console.log(`📨 Wiadomość od: ${senderId}, Treść: "${query}"`);

    const host = req.hostname;
    let requestUrl = `https://${host}/sendMessage`;

    console.log(`🔗 Wysyłam zapytanie do: ${requestUrl}`);

    await callSendMessage(requestUrl, senderId, query);

    res.status(200).send('OK'); 

  } catch (error) {
    console.error('❌ Błąd podczas przetwarzania webhooka:', error);
    res.status(500).send('Internal server error'); 
  }
});

module.exports = {
  router
};