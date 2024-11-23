import { env } from '@config/variables';
import { InternalServerError } from '@errors/internal.error';
import logger from '@utils/logger';
import Redis from 'ioredis';

class RedisProvider {
    private redisClient: Redis;

    public get client() {
        return this.redisClient;
    }

    public async connect(callback: any) {
        if (!env.redisURI) {
            throw new InternalServerError('Redis URI is not defined.');
        }

        this.redisClient = new Redis(env.redisURI);

        this.redisClient.on('error', (err: any) => {
            logger.error('Failed to connect Redis.');
            throw err;
        });

        this.redisClient.on('connect', () => {
            logger.info('Redis connected successfully.');
            callback();
        });
    }
}

const redisProvider = new RedisProvider();

export default redisProvider;
