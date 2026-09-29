const express = require('express');
const router = express.Router();
const {
  getPureSenders,
  getInactiveCustomers,
  getIdleAgents,
  getUnregisteredReceivers,
  getSendersNeverReceived,
  getAllExceptQueries,
} = require('../controllers/exceptQueriesController');

router.get('/all', getAllExceptQueries);
router.get('/pure-senders', getPureSenders);
router.get('/inactive-customers', getInactiveCustomers);
router.get('/idle-agents', getIdleAgents);
router.get('/unregistered-receivers', getUnregisteredReceivers);
router.get('/senders-never-received', getSendersNeverReceived);

module.exports = router;
