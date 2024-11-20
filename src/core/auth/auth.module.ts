import { signUpSchema } from '@schemas/signup.schema';
import { Router } from 'express';
import { signup } from './auth.service';

import rateLimited from '@middleware/ratelimit';
import validated from '@middleware/validator';
import asyncHandler from '@utils/async.handler';

export const authRouter = Router();

authRouter.post(
    '/signup',
    rateLimited,
    validated(signUpSchema),
    asyncHandler(signup)
);