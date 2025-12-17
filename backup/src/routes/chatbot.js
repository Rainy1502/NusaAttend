const express = require('express');
const router = express.Router();

// Chatbot routes
router.post('/ask', (req, res) => {
  res.json({ message: 'Chatbot response' });
});

module.exports = router;
