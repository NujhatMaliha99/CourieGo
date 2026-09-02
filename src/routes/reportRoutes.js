const express = require('express');

const router = express.Router();

const {
  getTopSenders,
  getTopSendersSubquery,
  getSenderReceiverPairs,
  getReceiverAddressReport,
  getSuspiciousReceivers,
  getZeroActivitySenders,
  getZeroActivityReceivers,
  getSenderWeightReport,
  getFullReport
} = require('../controllers/reportController');


router.get('/top-senders', getTopSenders);

router.get('/top-senders-subquery', getTopSendersSubquery);

router.get('/sender-receiver-pairs', getSenderReceiverPairs);

router.get('/receiver-address', getReceiverAddressReport);

router.get('/suspicious-receivers', getSuspiciousReceivers);

router.get('/zero-activity-senders', getZeroActivitySenders);

router.get('/zero-activity-receivers', getZeroActivityReceivers);

router.get('/sender-weight', getSenderWeightReport);

router.get('/full-report', getFullReport);


module.exports = router;