const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const bookingsPath = path.join(__dirname, '../data/bookings.json');
const groupsPath = path.join(__dirname, '../data/groups.json');

router.post('/', async (req, res) => {
  try {
    const { groupId, sessionId, userName, userEmail } = req.body;
    
    if (!groupId || !sessionId || !userName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const groupsData = await fs.readFile(groupsPath, 'utf8');
    const groups = JSON.parse(groupsData);
    const group = groups.find(g => g.id === groupId);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const session = group.sessions.find(s => s.id === sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.bookedSeats >= group.capacity) {
      return res.status(400).json({ error: 'Session is fully booked' });
    }

    const bookingId = `BK${Date.now()}`;
    const booking = {
      id: bookingId,
      groupId,
      sessionId,
      groupName: group.name,
      sessionDate: session.date,
      sessionTime: session.time,
      therapist: session.therapist,
      userName,
      userEmail,
      createdAt: new Date().toISOString()
    };

    let bookings = [];
    try {
      const bookingsData = await fs.readFile(bookingsPath, 'utf8');
      bookings = JSON.parse(bookingsData);
    } catch (e) {
      bookings = [];
    }
    
    bookings.push(booking);
    await fs.writeFile(bookingsPath, JSON.stringify(bookings, null, 2));

    session.bookedSeats += 1;
    await fs.writeFile(groupsPath, JSON.stringify(groups, null, 2));

    res.json({ 
      success: true, 
      booking,
      remainingSeats: group.capacity - session.bookedSeats
    });
  } catch (error) {
    console.error('Booking Error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const bookingsData = await fs.readFile(bookingsPath, 'utf8');
    const bookings = JSON.parse(bookingsData);
    const booking = bookings.find(b => b.id === req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Booking Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

module.exports = router;
