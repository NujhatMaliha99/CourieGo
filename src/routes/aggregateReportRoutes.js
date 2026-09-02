const express = require('express');

const {
  getParcelTypeRevenue,
  getParcelTypeWeight,
  getStatusChargeRange,
  getHighChargeSenders,
  getAboveAverageChargeParcels,
  getHeaviestParcelSenders
} = require('../controllers/aggregateReportController');

const router = express.Router();

router.get('/parcel-type-revenue', getParcelTypeRevenue);

router.get('/parcel-type-weight', getParcelTypeWeight);

router.get('/status-charge-range', getStatusChargeRange);

router.get('/high-charge-senders', getHighChargeSenders);

router.get('/above-average-charge', getAboveAverageChargeParcels);

router.get('/heaviest-parcel-senders', getHeaviestParcelSenders);

module.exports = router;