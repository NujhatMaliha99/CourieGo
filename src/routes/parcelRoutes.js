const express = require('express');
const parcelController = require('../controllers/parcelController');
const validateParcel = require('../middleware/validateParcel');

const router = express.Router();

router.get('/', parcelController.getAllParcels);
router.get('/:id', parcelController.getParcelById);
router.post('/', validateParcel, parcelController.createParcel);

module.exports = router;
