const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const groupsPath = path.join(__dirname, '../data/groups.json');

router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(groupsPath, 'utf8');
    const groups = JSON.parse(data);
    res.json(groups);
  } catch (error) {
    console.error('Groups Error:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await fs.readFile(groupsPath, 'utf8');
    const groups = JSON.parse(data);
    const group = groups.find(g => g.id === req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json(group);
  } catch (error) {
    console.error('Group Error:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

router.post('/slots/generate', async (req, res) => {
  try {
    const { groupId } = req.body;
    
    const data = await fs.readFile(groupsPath, 'utf8');
    const groups = JSON.parse(data);
    const group = groups.find(g => g.id === groupId);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    const availableSlots = group.sessions.filter(s => s.bookedSeats < group.capacity);
    
    res.json({ availableSlots });
  } catch (error) {
    console.error('Slots Error:', error);
    res.status(500).json({ error: 'Failed to generate slots' });
  }
});

module.exports = router;
