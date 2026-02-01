const express = require('express');
const router = express.Router();
const { generateResponse } = require('../services/aiService');

router.post('/', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await generateResponse(message, conversationHistory || []);
    
    res.json({ response });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

module.exports = router;
