const express = require('express');
const {
  getPureSenders,
  getInactiveCustomers,
  getIdleAgents,
  getUnregisteredReceivers,
  getSendersNeverReceived,
  getAllExceptQueries,
} = require('../controllers/exceptController');

const router = express.Router();

router.get('/', getAllExceptQueries);
router.get('/all', getAllExceptQueries);
router.get('/pure-senders', getPureSenders);
router.get('/inactive-customers', getInactiveCustomers);
router.get('/idle-agents', getIdleAgents);
router.get('/unregistered-receivers', getUnregisteredReceivers);
router.get('/senders-never-received', getSendersNeverReceived);

module.exports = router;


