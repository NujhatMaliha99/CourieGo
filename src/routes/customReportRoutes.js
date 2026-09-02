const express = require('express');
const router = express.Router();
const {
  getDistinctSenderAvgCharge,
  getReceiverWeightAnalysis,
  getStatusSummary,
  getReceiversAboveAvgWeight,
  getSenderChargeAnalysis,
  getReceiverAddressSummary
} = require('../controllers/customReportController');

router.get('/distinct-sender-avg-charge', getDistinctSenderAvgCharge);
router.get('/receiver-weight-analysis', getReceiverWeightAnalysis);
router.get('/status-summary', getStatusSummary);
router.get('/receivers-above-avg-weight', getReceiversAboveAvgWeight);
router.get('/sender-charge-analysis', getSenderChargeAnalysis);
router.get('/receiver-address-summary', getReceiverAddressSummary);

module.exports = router;