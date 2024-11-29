import { env } from '@config/variables';
import { ApplicationError } from '@errors/application.error';
import { NextFunction, Request, Response } from 'express';

import http from '@constants/http';
import logger from '@utils/logger';

function globalErrorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (err instanceof ApplicationError) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            code: err.statusCode,
            stack: env.app.environment.isInDevelopment ? err.stack : {},
        });
    } else {
        logger.error(err);

        res.status(http.INTERNAL_SERVER_ERROR).json({
            status: 'server_error',
            message: 'Something went wrong internally.',
            code: http.INTERNAL_SERVER_ERROR,
            stack: env.app.environment.isInDevelopment ? err.stack : {},
        });
    }
}

export default globalErrorHandler;
