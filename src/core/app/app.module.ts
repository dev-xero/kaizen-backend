import corsOptions from '@config/cors';
import { env } from '@config/variables';
import logger from '@utils/logger';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

export async function StartApplication() {
    const app = express();
    const port = env.app.port;

    app.disable('x-powered-by');

    app.use(helmet());
    app.use(compression());
    app.use(cors(corsOptions));
    app.use(express.urlencoded({ extended: false }));

    app.use(express.json());

    app.listen(port, () =>
        logger.info(
            `Server started at ${env.app.address} in ${env.app.environment.mode} environment.`
        )
    );
}
