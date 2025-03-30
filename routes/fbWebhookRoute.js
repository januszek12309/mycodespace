const express = require('express');
const router = express.Router();
require('dotenv').config();
const axios = require("axios").default;

// Endpoint weryfikacji (GET)
// Endpoint weryfikacji (GET)
router.get('/', (req, res) => {
  console.log(`Full URL: ${req.originalUrl}`);

  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Jeśli brak parametrów w zapytaniu, wykonaj odpowiednią akcję
  if (!mode || !token || !challenge) {
    console.log('⚠️ Missing parameters, returning 200 OK');
    res.status(200).send("OK");  // Zwróć OK bez parametrów
    return;
  }

  console.log(`🔹 mode: ${mode}, token: ${token}, challenge: ${challenge}`);

  // Jeżeli mamy poprawne parametry, wykonaj weryfikację
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('✅ WEBHOOK_VERIFIED');
    res.status(200).send(challenge);  // Odpowiedź na wyzwanie
  } else {
    console.log(`❌ Invalid token or mode - otrzymano token: ${token}, a oczekiwano: ${process.env.VERIFY_TOKEN}`);
    res.sendStatus(403);  // Jeśli token lub tryb są nieprawidłowe
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
router.post('/', (req, res) => {
  console.log('📥 Otrzymano żądanie POST:', req.body); // Loguje pełne body

  try {
    let body = req.body;

    if (!body.entry || !body.entry[0].messaging || !body.entry[0].messaging[0]) {
      console.log('⚠️ Nieprawidłowe dane w body:', body);
      return res.status(400).send('Invalid payload'); 
    }

    // Przetwarzanie wiadomości
    let senderId = body.entry[0].messaging[0].sender.id;
    let query = body.entry[0].messaging[0].message.text;

    console.log(`📨 Wiadomość od: ${senderId}, Treść: "${query}"`);
    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Błąd podczas przetwarzania webhooka:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = {
  router
};