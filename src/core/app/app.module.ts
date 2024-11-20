import { env } from '@config/variables';
import express, { NextFunction, Request, Response } from 'express';

import corsOptions from '@config/cors';
import http from '@constants/http';
import globalErrorHandler from '@middleware/errorhandler';
import notFoundHandler from '@middleware/notfound';
import logger from '@utils/logger';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import cached from 'src/middleware/cache';
import { authRouter } from '@core/auth';

export async function startApplication() {
    const app = express();
    const port = env.app.port;

    app.disable('x-powered-by');

    app.use(helmet());
    app.use(compression());
    app.use(cors(corsOptions));
    app.use(express.urlencoded({ extended: false }));

    app.use(express.json());

    // Decline malformed json request bodies
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof SyntaxError) {
            res.status(http.BAD_REQUEST).json({
                status: 'error',
                message: 'Malformed json received.',
                code: http.BAD_REQUEST,
            });
        }

        next();
    });

    app.use('/v1/auth', authRouter);

    // Base endpoint
    app.get('/', cached('5 minutes'), (_: Request, res: Response) => {
        res.status(http.OK).json({
            status: 'success',
            message:
                'All systems functional, prefix endpoints with v1 to access the API.',
            code: http.OK,
        });
    });

    app.use(notFoundHandler);
    app.use(globalErrorHandler);

    app.listen(port, () =>
        logger.info(
            `Server started at ${env.app.address} in ${env.app.environment.mode} environment.`
        )
    );
}
