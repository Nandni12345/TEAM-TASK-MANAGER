const express = require('express');
const router = express.Router();
const { getTasksByProject, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/project/:projectId', protect, getTasksByProject);
router.post('/', protect, adminOnly, createTask);
router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, adminOnly, deleteTask);

module.exports = router;
