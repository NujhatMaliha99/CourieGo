const express = require('express');
const router = express.Router();
const {
  getAllDeliveryAgents,
  getDeliveryAgentById,
  createDeliveryAgent,
  updateDeliveryAgent,
  deleteDeliveryAgent,
} = require('../controllers/Deliveryagentcontroller');

router.get('/', getAllDeliveryAgents);
router.get('/:id', getDeliveryAgentById);
router.post('/', createDeliveryAgent);
router.put('/:id', updateDeliveryAgent);
router.delete('/:id', deleteDeliveryAgent);

module.exports = router;