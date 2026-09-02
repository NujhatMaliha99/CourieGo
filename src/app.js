const express = require('express');
const cors = require('cors');

const parcelRoutes = require('./routes/parcelRoutes');
const receiverRoutes = require('./routes/receiverRoutes');
const senderRoutes = require('./routes/senderRoutes');
const reportRoutes = require('./routes/reportRoutes');
const customReportRoutes = require('./routes/customReportRoutes');
const innerLeftReportRoutes = require('./routes/innerLeftReportRoutes');
const aggregateReportRoutes = require('./routes/aggregateReportRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    message: 'Courier Delivery Management API is running.'
  });
});

// Main routes
app.use('/api/parcels', parcelRoutes);
app.use('/api/receivers', receiverRoutes);
app.use('/api/senders', senderRoutes);

// Reports
app.use('/api/reports', reportRoutes);
app.use('/api/custom-reports', customReportRoutes);
app.use('/api/aggregate-reports', aggregateReportRoutes);
app.use('/api/sql-queries', innerLeftReportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found.'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error);

  if (error.number === 2601 || error.number === 2627) {
    return res.status(409).json({
      message: 'A unique value (tracking ID or email) already exists.'
    });
  }

  if (error.number === 547) {
    return res.status(400).json({
      message:
        'Foreign key conflict: the related sender, receiver, or parcel is missing or still in use.'
    });
  }

  return res.status(500).json({
    message: 'Internal server error.'
  });
});

module.exports = app;