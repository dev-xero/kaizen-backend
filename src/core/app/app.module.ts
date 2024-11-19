import { env } from '@config/variables';
import logger from '@utils/logger';
import express from 'express';

export async function StartApplication() {
    const app = express();
    const port = env.app.port;

    app.listen(port, () =>
        logger.info(
            `Server started at ${env.app.address} in ${env.app.environment.mode} environment.`
        )
    );
}
