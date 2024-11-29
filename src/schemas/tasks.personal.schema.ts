import Joi from 'joi';

// Request body schema for creating personal tasks
export const personalTaskSchema = Joi.object({
    name: Joi.string().required().min(1),
    description: Joi.string().required().min(1),
    category: Joi.string()
        .valid('TODO', 'IN_PROGRESS', 'TESTING', 'COMPLETED')
        .required(),
    createdAt: Joi.date().required(),
    dueOn: Joi.date(),
    isCompleted: Joi.boolean(),
});
