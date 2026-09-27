const express = require('express');
const deliveryAgentController = require('../controllers/deliveryAgentController');
const validateDeliveryAgent = require('../middleware/validateDeliveryAgent');

const router = express.Router();

router.get('/', deliveryAgentController.getAllDeliveryAgents);
router.get('/:id', deliveryAgentController.getDeliveryAgentById);
router.post('/', validateDeliveryAgent, deliveryAgentController.createDeliveryAgent);
router.put('/:id', validateDeliveryAgent, deliveryAgentController.updateDeliveryAgent);
router.delete('/:id', deliveryAgentController.deleteDeliveryAgent);

module.exports = router;