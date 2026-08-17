const express = require('express');
const receiverController = require('../controllers/receiverController');
const validateReceiver = require('../middleware/validateReceiver');

const router = express.Router();

router.post('/', validateReceiver, receiverController.createReceiver);

module.exports = router;
