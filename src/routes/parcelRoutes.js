const express = require('express');
const parcelController = require('../controllers/parcelController');
const validateParcel = require('../middleware/validateParcel');

const router = express.Router();

router.post('/', validateParcel, parcelController.createParcel);
router.get('/', parcelController.getAllParcels);
router.get('/:id', parcelController.getParcelById);
router.put('/:id', validateParcel, parcelController.updateParcel);
router.delete('/:id', parcelController.deleteParcel);

module.exports = router;
