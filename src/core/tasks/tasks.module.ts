import { Router } from 'express';
import { createPersonalTask, getPersonalTasks } from './tasks.service';

import authorized from '@middleware/authorization';
import rateLimited from '@middleware/ratelimit';
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
    asyncHandler(createPersonalTask)
);
