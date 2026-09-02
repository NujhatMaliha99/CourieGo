const express = require('express');
const innerLeftReportController = require('../controllers/innerLeftReportController');

const router = express.Router();

router.get('/inner-join', innerLeftReportController.getMatchingParcelDetails);
router.get('/left-join', innerLeftReportController.getAllReceiversWithParcels);
router.get('/receiver-counts', innerLeftReportController.getReceiverParcelCounts);
router.get('/above-average-charge', innerLeftReportController.getAboveAverageChargeParcels);
router.get('/no-pending-receivers', innerLeftReportController.getReceiversWithoutPendingParcels);

module.exports = router;
