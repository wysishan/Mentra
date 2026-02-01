require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

const chatRoutes = require('./routes/chat');
const insightsRoutes = require('./routes/insights');
const groupsRoutes = require('./routes/groups');
const bookingRoutes = require('./routes/booking');
const handoffRoutes = require('./routes/handoff');

app.use('/api/chat', chatRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/handoff', handoffRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
  console.log(`Mentra Bounty server running on http://localhost:${PORT}`);
});
