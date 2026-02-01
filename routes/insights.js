const express = require('express');
const router = express.Router();
const { extractInsights, recommendGroup } = require('../services/aiService');
const groupsData = require('../data/groups.json');

router.post('/', async (req, res) => {
  try {
    const { conversationHistory } = req.body;
    
    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return res.status(400).json({ error: 'Conversation history is required' });
    }

    const insights = await extractInsights(conversationHistory);
    
    if (insights.recommendedGroup) {
      res.json(insights);
    } else {
      const recommendation = await recommendGroup(insights, groupsData);
      res.json({ ...insights, recommendedGroup: recommendation });
    }
  } catch (error) {
    console.error('Insights Error:', error);
    res.status(500).json({ error: 'Failed to extract insights' });
  }
});

module.exports = router;
