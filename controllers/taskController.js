const { tasks, getNextId } = require('../models/taskModel');
const { PRIORITIES } = require('../middlewares/validateTask');

const getAllTasks = (req, res, next) => {
    const { completed, sort = 'createdAt', order = 'asc' } = req.query;
    let results = [...tasks];

    if (completed !== undefined) {
        if (completed !== 'true' && completed !== 'false') {
            return next({
                status: 400,
                message: 'Query param "completed" must be "true" or "false"',
            });
        }
        results = results.filter((task) => task.completed === (completed === 'true'));
    }

    if (sort !== 'createdAt') {
        return next({ status: 400, message: 'Query param "sort" only supports "createdAt"' });
    }

    if (order !== 'asc' && order !== 'desc') {
        return next({ status: 400, message: 'Query param "order" must be "asc" or "desc"' });
    }

    const direction = order === 'asc' ? 1 : -1;
    results.sort((a, b) => direction * (new Date(a.createdAt) - new Date(b.createdAt)));

    return res.status(200).json(results);
};

const getTaskById = (req, res, next) => {
    const task = tasks.find((t) => t.id === req.taskId);

    if (!task) {
        return next({ status: 404, message: `Task with id ${req.taskId} not found` });
    }

    return res.status(200).json(task);
};

const getTasksByPriority = (req, res, next) => {
    const { level } = req.params;

    if (!PRIORITIES.includes(level)) {
        return next({
            status: 400,
            message: `Priority must be one of: ${PRIORITIES.join(', ')}`,
        });
    }

    return res.status(200).json(tasks.filter((task) => task.priority === level));
};

const createTask = (req, res) => {
    const { title, description, completed, priority } = req.body;

    const task = {
        id: getNextId(),
        title,
        description,
        completed,
        priority: priority || 'medium',
        createdAt: new Date().toISOString(),
    };

    tasks.push(task);
    return res.status(201).json(task);
};

const updateTask = (req, res, next) => {
    const index = tasks.findIndex((t) => t.id === req.taskId);

    if (index === -1) {
        return next({ status: 404, message: `Task with id ${req.taskId} not found` });
    }

    const { title, description, completed, priority } = req.body;

    tasks[index] = {
        ...tasks[index],
        title,
        description,
        completed,
        priority: priority || tasks[index].priority,
    };

    return res.status(200).json(tasks[index]);
};

const deleteTask = (req, res, next) => {
    const index = tasks.findIndex((t) => t.id === req.taskId);

    if (index === -1) {
        return next({ status: 404, message: `Task with id ${req.taskId} not found` });
    }

    const deleted = tasks.splice(index, 1)[0];
    return res.status(200).json(deleted);
};

module.exports = {
    getAllTasks,
    getTaskById,
    getTasksByPriority,
    createTask,
    updateTask,
    deleteTask,
};
