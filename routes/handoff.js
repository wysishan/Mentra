const express = require('express');
const router = express.Router();
const { generateHandoffSummary } = require('../services/aiService');
const fs = require('fs').promises;
const path = require('path');

const bookingsPath = path.join(__dirname, '../data/bookings.json');

router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const bookingsData = await fs.readFile(bookingsPath, 'utf8');
    const bookings = JSON.parse(bookingsData);
    
    const groupBookings = bookings.filter(b => b.groupId === groupId);
    
    const participants = groupBookings.map(b => ({
      name: b.userName,
      concern: 'Individual concerns from intake process'
    }));

    const syntheticParticipants = [
      { name: 'Alex M.', concern: 'Managing work-related anxiety' },
      { name: 'Jordan K.', concern: 'Coping with recent life changes' }
    ];

    const allParticipants = [...participants, ...syntheticParticipants].slice(0, 3);

    const conversationSummary = 'Group members have completed intake and are preparing for their first session. Common themes include anxiety management and work-life balance.';

    const handoff = await generateHandoffSummary(groupId, allParticipants, conversationSummary);

    res.json({
      groupId,
      handoff,
      participants: allParticipants,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Handoff Error:', error);
    res.status(500).json({ error: 'Failed to generate handoff' });
  }
});

module.exports = router;
