import { Router } from 'express';
import { createPersonalTask, getPersonalTasks } from './tasks.service';

import authorized from '@middleware/authorization';
import rateLimited from '@middleware/ratelimit';
import asyncHandler from '@utils/async.handler';
import validated from '@middleware/validator';
import { personalTaskSchema } from '@schemas/tasks.personal.schema';

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
