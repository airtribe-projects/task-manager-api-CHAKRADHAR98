const PRIORITIES = ['low', 'medium', 'high'];

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const validateTask = (req, res, next) => {
    const { title, description, completed, priority } = req.body || {};
    const errors = [];

    if (!isNonEmptyString(title)) {
        errors.push('title is required and must be a non-empty string');
    }

    if (!isNonEmptyString(description)) {
        errors.push('description is required and must be a non-empty string');
    }

    if (typeof completed !== 'boolean') {
        errors.push('completed is required and must be a boolean');
    }

    if (priority !== undefined && !PRIORITIES.includes(priority)) {
        errors.push(`priority must be one of: ${PRIORITIES.join(', ')}`);
    }

    if (errors.length > 0) {
        return next({ status: 400, message: 'Invalid task payload', details: errors });
    }

    return next();
};

const validateIdParam = (req, res, next) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return next({ status: 400, message: 'Task id must be a positive integer' });
    }

    req.taskId = id;
    return next();
};

module.exports = { validateTask, validateIdParam, PRIORITIES };
