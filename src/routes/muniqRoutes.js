const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/munia.controller');

// 5 Analytics Routes
router.get('/receiver-charge-summary', analyticsController.getReceiverChargeSummary);
router.get('/parcel-status-summary', analyticsController.getParcelStatusSummary);
router.get('/sender-activity-summary', analyticsController.getSenderActivitySummary);
router.get('/frequent-receivers', analyticsController.getFrequentReceivers);

// Route URL ঠিক করা হলো: '/above-average-charge-parcels'
router.get('/above-average-charge-parcels', analyticsController.getAboveAverageChargeParcels);

module.exports = router;