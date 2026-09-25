const express = require('express');
const {
	getAllExtraFeatures,
	getParcelsByStatus,
	getAuditLogs,
	runProcedureAndTransaction,
} = require('../controllers/controllers/extraFeaturesController');

const router = express.Router();

router.get('/features', getAllExtraFeatures);
router.get('/parcels-by-status', getParcelsByStatus);
router.get('/audit-logs', getAuditLogs);
router.post('/transaction-demo', runProcedureAndTransaction);

module.exports = router;