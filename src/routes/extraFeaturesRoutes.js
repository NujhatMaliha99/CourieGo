const express = require('express');
const {
	getAllExtraFeatures,
	getParcelsByStatus,
	runProcedureAndTransaction,
} = require('../controllers/controllers/extraFeaturesController');

const router = express.Router();

router.get('/features', getAllExtraFeatures);
router.get('/parcels-by-status', getParcelsByStatus);
router.post('/transaction-demo', runProcedureAndTransaction);

module.exports = router;