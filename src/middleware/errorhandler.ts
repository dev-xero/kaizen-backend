import { ApplicationError } from '@errors/application.error';
import { NextFunction, Response, Request } from 'express';
import http from '@constants/http';
import logger from '@utils/logger';

function globalErrorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (err instanceof ApplicationError) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            code: err.statusCode,
        });
    } else {
        logger.error(err);
        res.status(http.INTERNAL_SERVER_ERROR).json({
            status: 'server_error',
            message: 'Something went wrong internally.',
            code: http.INTERNAL_SERVER_ERROR,
        });
    }
}

export default globalErrorHandler;