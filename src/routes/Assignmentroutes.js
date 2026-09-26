const express = require('express');
const router = express.Router();
const {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  completeAssignment,
} = require('../controllers/AssignmentController');

router.get('/', getAllAssignments);
router.get('/:id', getAssignmentById);
router.post('/', createAssignment);
router.put('/:id/complete', completeAssignment);

module.exports = router;