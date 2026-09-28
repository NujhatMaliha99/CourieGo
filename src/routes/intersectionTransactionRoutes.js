const express = require('express');

const {
  getIntersectionTransaction,
} = require('../controllers/intersectionTransactionController');

const router = express.Router();

router.get(
  '/',
  getIntersectionTransaction
);

module.exports = router;