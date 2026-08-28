const express = require('express');
const senderController = require('../controllers/senderController');
const validateSender = require('../middleware/validateSender');

const router = express.Router();

router.get('/', senderController.getAllSenders);
router.get('/:id', senderController.getSenderById);
router.post('/', validateSender, senderController.createSender);
router.put('/:id', validateSender, senderController.updateSender);

module.exports = router;
