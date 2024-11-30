import { Router } from 'express';
import { getUserInformation } from './user.service';

import authorized from '@middleware/authorization';
import rateLimited from '@middleware/ratelimit';
import asyncHandler from '@utils/async.handler';

export const userRouter = Router();

// Handles requests to get only the authorized user's information
userRouter.get(
    '/info/:username',
    rateLimited,
    authorized,
    asyncHandler(getUserInformation)
);
