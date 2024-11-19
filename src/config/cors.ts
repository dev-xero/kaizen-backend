const corsOptions = {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

export default corsOptions;
