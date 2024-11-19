import rateLimit from 'express-rate-limit';

const rateLimited = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        status: 'rated_limited',
        message: 'You are being rate limited.',
    },
});

export default rateLimited;