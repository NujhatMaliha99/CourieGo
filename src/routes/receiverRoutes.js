const express = require('express');
const receiverController = require('../controllers/receiverController');
const validateReceiver = require('../middleware/validateReceiver');

const router = express.Router();

router.get('/', receiverController.getAllReceivers);
router.get('/:id', receiverController.getReceiverById);
router.post('/', validateReceiver, receiverController.createReceiver);
router.put('/:id', validateReceiver, receiverController.updateReceiver);

module.exports = router;
