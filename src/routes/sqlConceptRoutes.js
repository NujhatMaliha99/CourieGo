const express = require('express');
const {
  getUnionComparison,
  getViews,
  findParcelByTrackingId,
  getSenderChargeSummary,
} = require('../controllers/sqlConceptController');

const router = express.Router();

router.get('/union', getUnionComparison);
router.get('/views', getViews);
router.get('/procedures/search', findParcelByTrackingId);
router.get('/procedures/sender-summary', getSenderChargeSummary);

module.exports = router;
