const express = require('express');
const taskController = require('../controllers/taskController');
const { validateTask, validateIdParam } = require('../middlewares/validateTask');

const router = express.Router();

router.get('/', taskController.getAllTasks);
router.get('/priority/:level', taskController.getTasksByPriority);
router.get('/:id', validateIdParam, taskController.getTaskById);
router.post('/', validateTask, taskController.createTask);
router.put('/:id', validateIdParam, validateTask, taskController.updateTask);
router.delete('/:id', validateIdParam, taskController.deleteTask);

module.exports = router;
