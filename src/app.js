const express = require('express');
const cors = require('cors');

const parcelRoutes = require('./routes/parcelRoutes');
const receiverRoutes = require('./routes/receiverRoutes');
const senderRoutes = require('./routes/senderRoutes');
const deliveryAgentRoutes = require('./routes/deliveryAgentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const customReportRoutes = require('./routes/customReportRoutes');
const innerLeftReportRoutes = require('./routes/innerLeftReportRoutes');
const aggregateReportRoutes = require('./routes/aggregateReportRoutes');
const sqlConceptRoutes = require('./routes/sqlConceptRoutes');

const app = express();


// ==========================================
// Middleware
// ==========================================

app.use(cors());
app.use(express.json());


// ==========================================
// Chatbot API
// POST /api/chat
// ==========================================

app.post('/api/chat', (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();

    // Make sure the user entered a message
    if (!message) {
      return res.status(400).json({
        message: 'Please enter a message.',
      });
    }

    const question = message.toLowerCase();

    let reply;


    // Greeting
    if (
      question === 'hi' ||
      question === 'hello' ||
      question === 'hey' ||
      question.includes('assalam') ||
      question.includes('salam')
    ) {
      reply =
        'Hello! 👋 Welcome to CourieGo. How can I help you with your parcel today?';
    }


    // Help
    else if (
      question.includes('help') ||
      question.includes('what can you do')
    ) {
      reply =
        'I can help you with parcel tracking, parcel status, sender information, receiver information, delivery information, and general CourieGo questions.';
    }


    // Tracking
    else if (
      question.includes('track') ||
      question.includes('tracking')
    ) {
      reply =
        'You can track a parcel using its Tracking ID or Parcel ID. Please enter the parcel ID in the parcel search section.';
    }


    // Parcel status
    else if (
      question.includes('status') ||
      question.includes('where is my parcel') ||
      question.includes('where is my package')
    ) {
      reply =
        "To check a parcel's current status, use its Parcel ID or Tracking ID in the parcel search section.";
    }


    // Sender
    else if (question.includes('sender')) {
      reply =
        'Sender information can be viewed and managed from the Sender Management section of CourieGo.';
    }


    // Receiver
    else if (question.includes('receiver')) {
      reply =
        'Receiver information can be viewed and managed from the Receiver Management section of CourieGo.';
    }


    // Delivery
    else if (
      question.includes('delivery') ||
      question.includes('delivered')
    ) {
      reply =
        'Parcel delivery progress is shown through statuses such as Pending, Picked Up, In Transit, Out for Delivery, and Delivered.';
    }


    // Price / Charge
    else if (
      question.includes('price') ||
      question.includes('cost') ||
      question.includes('charge')
    ) {
      reply =
        'The delivery charge for each parcel is stored in the parcel information. You can view it from the parcel list or parcel details.';
    }


    // Parcel
    else if (
      question.includes('parcel') ||
      question.includes('package')
    ) {
      reply =
        'CourieGo allows you to create, search, update, view, and delete parcel records.';
    }


    // Reports
    else if (question.includes('report')) {
      reply =
        'CourieGo provides several reporting options, including sender-receiver reports, custom reports, aggregate reports, and SQL query reports.';
    }


    // Thanks
    else if (question.includes('thank')) {
      reply =
        "You're welcome! 😊 Is there anything else I can help you with?";
    }


    // Goodbye
    else if (
      question === 'bye' ||
      question.includes('goodbye')
    ) {
      reply =
        'Goodbye! 👋 Thank you for using CourieGo.';
    }


    // Default reply
    else {
      reply =
        "I'm not sure about that yet. You can ask me about parcels, tracking, delivery status, senders, receivers, charges, or reports.";
    }


    return res.status(200).json({
      reply,
    });
  } catch (error) {
    console.error('Chatbot error:', error);

    return res.status(500).json({
      message: 'Something went wrong with the chatbot.',
    });
  }
});


// ==========================================
// Health check
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({
    message: 'Courier Delivery Management API is running.',
  });
});


// ==========================================
// Main routes
// ==========================================

app.use('/api/parcels', parcelRoutes);
app.use('/api/receivers', receiverRoutes);
app.use('/api/senders', senderRoutes);
app.use('/api/delivery-agents', deliveryAgentRoutes);


// ==========================================
// Report routes
// ==========================================

app.use('/api/reports', reportRoutes);
app.use('/api/custom-reports', customReportRoutes);
app.use('/api/aggregate-reports', aggregateReportRoutes);
app.use('/api/sql-queries', innerLeftReportRoutes);
app.use('/api/sql-concepts', sqlConceptRoutes);


// ==========================================
// 404 handler
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found.',
  });
});


// ==========================================
// Error handler
// ==========================================

app.use((error, req, res, next) => {
  console.error(error);

  // Duplicate key / unique constraint
  if (error.number === 2601 || error.number === 2627) {
    return res.status(409).json({
      message:
        'A unique value (tracking ID or email) already exists.',
    });
  }

  // Foreign key conflict
  if (error.number === 547) {
    return res.status(400).json({
      message:
        'Foreign key conflict: the related sender, receiver, or parcel is missing or still in use.',
    });
  }

  return res.status(500).json({
    message: 'Internal server error.',
  });
});


module.exports = app;
