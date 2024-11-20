import { startApplication } from '@core/app/app.module';
import databaseProvider from '@providers/database.provider';
import redisProvider from '@providers/redis.provider';
import logger from '@utils/logger';

async function initializeConnections() {
    try {
        await databaseProvider.connect();
        await redisProvider.connect();
        startApplication();
    } catch (err) {
        logger.error(err);
        logger.warn('Terminating.');
    }
}

initializeConnections();
