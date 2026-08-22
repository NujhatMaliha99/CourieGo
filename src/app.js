const express = require('express');
const cors = require('cors');
const parcelRoutes = require('./routes/parcelRoutes');
const receiverRoutes = require('./routes/receiverRoutes');

const app = express();

// Enable frontend access and parse JSON request bodies.
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ message: 'Courier Delivery Management API is running.' });
});

app.use('/api/parcels', parcelRoutes);
app.use('/api/receivers', receiverRoutes);

// Return a clear response for unknown endpoints.
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Central error handler keeps controller error responses consistent.
app.use((error, req, res, next) => {
  console.error(error);

  if (error.number === 2601 || error.number === 2627) {
    return res.status(409).json({ message: 'The tracking_id already exists.' });
  }
  if (error.number === 547) {
    return res.status(400).json({ message: 'The sender_id or receiver_id does not exist.' });
  }

  return res.status(500).json({ message: 'Internal server error.' });
});

module.exports = app;
