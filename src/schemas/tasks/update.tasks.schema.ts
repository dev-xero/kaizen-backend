import Joi from 'joi';

const TaskSchema = Joi.object({
    id: Joi.number(),
    name: Joi.string().required().min(1),
    description: Joi.string().required().min(1),
    category: Joi.string()
        .valid('TODO', 'IN_PROGRESS', 'TESTING', 'COMPLETED')
        .required(),
    createdAt: Joi.date().required(),
    dueOn: Joi.date().required(),
    isCompleted: Joi.boolean().required(),
});

// Request body schema for updating personal tasks
export const updatePersonalTaskSchema = Joi.object({
    tasks: Joi.array().items(TaskSchema).required(),
});
