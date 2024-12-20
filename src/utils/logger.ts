import { join } from 'path';
import { env } from '@config/variables';
import { createLogger, transports, format } from 'winston';

import root from 'app-root-path';

const { combine, printf, timestamp, colorize } = format;

function logFormat() {
    return printf((info: any) => {
        return `${info.timestamp} ${info.level}: ${info.stack || info.message}`;
    });
}

function productionLogger() {
    return createLogger({
        format: combine(colorize(), timestamp(), logFormat()),
        transports: [
            new transports.Console(),
            new transports.File({
                filename: join(root.toString(), 'logs/prod.log'),
            }),
        ],
    });
}

function developmentLogger() {
    return createLogger({
        format: combine(colorize(), timestamp(), logFormat()),
        transports: [
            new transports.Console(),
            new transports.File({
                filename: join(root.toString(), 'logs/dev.log'),
            }),
        ],
    });
}

const logger = env.app.environment.isInDevelopment
    ? developmentLogger()
    : productionLogger();

export default logger;
