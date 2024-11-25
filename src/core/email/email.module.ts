import { Router } from 'express';
import { verify } from './email.service';

import rateLimited from '@middleware/ratelimit';
import asyncHandler from '@utils/async.handler';

export const emailRouter = Router();

emailRouter.get('/verify', rateLimited, asyncHandler(verify));
