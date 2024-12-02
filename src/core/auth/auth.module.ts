import { genAccessSchema } from '@schemas/auth';
import { signInSchema, signUpSchema } from '@schemas/auth/';
import { Router } from 'express';
import { generate, signin, signup } from './auth.service';

import rateLimited from '@middleware/ratelimit';
import validated from '@middleware/validator';
import asyncHandler from '@utils/async.handler';

export const authRouter = Router();

// This handles sign up requests after validation.
authRouter.post(
    '/signup',
    rateLimited,
    validated(signUpSchema),
    asyncHandler(signup)
);

// This handles sign in requests after validation.
authRouter.post(
    '/signin',
    rateLimited,
    validated(signInSchema),
    asyncHandler(signin)
);

// This handles access token generation requests after validation.
authRouter.post(
    '/generate',
    rateLimited,
    validated(genAccessSchema),
    asyncHandler(generate)
);
