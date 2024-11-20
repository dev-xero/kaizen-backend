import dotenv from 'dotenv';
import { environment } from './environment';

dotenv.config();

export const env = Object.freeze({
    app: {
        port: parseInt(process.env.PORT || '8000', 10),
        hostname: process.env.HOSTNAME,
        address:
            process.env.ENVIRONMENT == 'dev'
                ? `http://${process.env.HOSTNAME}:${process.env.PORT}`
                : `https://${process.env.HOSTNAME}`,
        environment: {
            mode: process.env.ENVIRONMENT,
            isInProduction: environment.PROD == process.env.ENVIRONMENT,
            isInDevelopment: environment.DEV == process.env.ENVIRONMENT,
        },
    },
    redisURI: process.env.REDIS_URI,
    tokens: {
        accessKey: process.env.ACCESS_TOKEN_SECRET
        refreshKey: process.env.REFRESH_TOKEN_SECRET,
    },
});
