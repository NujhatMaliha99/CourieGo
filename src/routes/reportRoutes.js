const express = require('express');
const router = express.Router();
const {
  getDistinctSenderAvgCharge,
  getReceiverWeightAnalysis,
  getStatusSummary,
  getReceiversAboveAvgWeight,
  getSenderChargeAnalysis,
  getReceiverAddressSummary,
  getTopSenders,
  getSenderReceiverPairs,
  getReceiverAddressReport,
  getSuspiciousReceivers,
  getZeroActivitySenders,
  getZeroActivityReceivers,
  getSenderWeightReport,
  getFullReport
} = require('../controllers/reportController');

// Define routes
router.get('/distinct-sender-avg-charge', getDistinctSenderAvgCharge);
router.get('/receiver-weight-analysis', getReceiverWeightAnalysis);
router.get('/status-summary', getStatusSummary);
router.get('/receivers-above-avg-weight', getReceiversAboveAvgWeight);
router.get('/sender-charge-analysis', getSenderChargeAnalysis);
router.get('/receiver-address-summary', getReceiverAddressSummary);
router.get('/top-senders', getTopSenders);
router.get('/sender-receiver-pairs', getSenderReceiverPairs);
router.get('/receiver-address', getReceiverAddressReport);
router.get('/suspicious-receivers', getSuspiciousReceivers);
router.get('/zero-activity-senders', getZeroActivitySenders);
router.get('/zero-activity-receivers', getZeroActivityReceivers);
router.get('/sender-weight', getSenderWeightReport);
router.get('/full-report', getFullReport);

module.exports = router;