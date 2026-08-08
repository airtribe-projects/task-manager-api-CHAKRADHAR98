const seedData = require('../task.json');

const tasks = seedData.tasks.map((task, index) => ({
    ...task,
    priority: task.priority || 'medium',
    createdAt: new Date(Date.now() - (seedData.tasks.length - index) * 1000).toISOString(),
}));

const getNextId = () => tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;

module.exports = { tasks, getNextId };
