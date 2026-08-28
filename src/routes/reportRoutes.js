const express = require('express');
const reportController = require('../controllers/reportController');

const router = express.Router();

router.get('/checkpoint', reportController.getCheckpointReport);

module.exports = router;
