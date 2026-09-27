const express = require('express');
const {
  getAllExtraFeatures,
  getParcelsByStatus,
} = require('../controllers/extraFeaturesController');

const router = express.Router();

router.get('/features', getAllExtraFeatures);
router.get('/parcels-by-status', getParcelsByStatus);

module.exports = router;