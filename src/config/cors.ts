import { env } from "./variables";

const corsOptions = {
    origin: ['http://localhost:3000', env.app.clientURL],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

export default corsOptions;
