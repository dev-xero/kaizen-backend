import { InternalServerError } from '@errors/internal.error';
import { env } from './variables';

const clientURL = env.app.clientURL;

if (!clientURL) {
    throw new InternalServerError('Client URL is not configured.');
}

const corsOptions = {
    origin: ['http://localhost:3000', clientURL],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

export default corsOptions;
