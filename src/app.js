const express = require('express');
const cors = require('cors');

const parcelRoutes = require('./routes/parcelRoutes');
const receiverRoutes = require('./routes/receiverRoutes');
const senderRoutes = require('./routes/senderRoutes');

// Corrected file path: minuqRoutes instead of muniqRoutes

const analyticsRoutes = require('./routes/muniqRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api/parcels', parcelRoutes);
app.use('/api/receivers', receiverRoutes);
app.use('/api/senders', senderRoutes);

// Analytics Routes
app.use('/api/analytics', analyticsRoutes);

module.exports = app;