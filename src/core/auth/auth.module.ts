import { Router } from 'express';
import rateLimited from '@middleware/ratelimit';
import asyncHandler from '@utils/async.handler';
import { signup } from './auth.service';

export const authRouter = Router();

authRouter.post('/signup', rateLimited, asyncHandler(signup));
