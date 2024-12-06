import { personalTaskSchema, updatePersonalTaskSchema } from '@schemas/tasks';
import { Router } from 'express';
import {
    createPersonalTask,
    deletePersonalTask,
    getPersonalTasks,
    updatePersonalTask,
} from './tasks.service';

import authorized from '@middleware/authorization';
import rateLimited from '@middleware/ratelimit';
import validated from '@middleware/validator';
import asyncHandler from '@utils/async.handler';

export const tasksRouter = Router();

// Handles requests for getting personal tasks.
tasksRouter.get(
    '/personal/:username',
    rateLimited,
    authorized,
    asyncHandler(getPersonalTasks)
);

// Handles requests for creating personal tasks.
tasksRouter.post(
    '/personal/:username',
    rateLimited,
    authorized,
    validated(personalTaskSchema),
    asyncHandler(createPersonalTask)
);

// Handles requests to update personal tasks.
tasksRouter.patch(
    '/personal/:username',
    rateLimited,
    authorized,
    validated(updatePersonalTaskSchema),
    asyncHandler(updatePersonalTask)
);

// Handles requests to delete personal tasks.
tasksRouter.delete(
    '/personal/:username',
    rateLimited,
    authorized,
    asyncHandler(deletePersonalTask)
)
