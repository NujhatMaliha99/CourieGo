const express = require('express');
const parcelController = require('../controllers/parcelController');
const validateParcel = require('../middleware/validateParcel');

const router = express.Router();

router.post('/', validateParcel, parcelController.createParcel);

module.exports = router;
