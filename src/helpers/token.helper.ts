import { env } from '@config/variables';
import { InternalServerError } from '@errors/internal.error';

import redisProvider from '@providers/redis.provider';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

class TokenHelper {
    constructor() {}

    // Generates an access and refresh token from a username
    public generateTokens(username: string) {
        if (!env.tokens.accessKey || !env.tokens.refreshKey) {
            throw new InternalServerError(
                'Access or refresh token secret key is missing.'
            );
        }

        const payload = { username };

        const accessToken = jwt.sign(payload, env.tokens.accessKey, {
            expiresIn: '1h',
        });

        const refreshToken = crypto
            .createHash('sha-256')
            .update(`${env.tokens.refreshKey}@${username}:${Date.now()}`)
            .digest('base64url');

        return [accessToken, refreshToken];
    }

    // Verify token by comparing against secret key
    public async verityToken(accessToken: string): Promise<null | any> {
        try {
            const secret = env.tokens.accessKey;

            if (!secret) {
                throw new InternalServerError(
                    'Secret signing key could not be loaded.'
                );
            }

            return jwt.verify(accessToken, secret);
        } catch (err) {
            return null;
        }
    }

    // Retrieve refresh token
    public async retrieveRefreshToken(
        username: string
    ): Promise<string | null> {
        return await redisProvider.client.get(username);
    }

    // Saves a username-refresh token entry
    public async saveRefreshToken(username: string, token: string) {
        const key = `refresh:${username}`;

        await redisProvider.client.hset(key, username, token);
        await redisProvider.client.expire(key, 172800); // expires in 2 days
    }

    // Saves a username-verification code entry
    public async saveVerificationCode(username: string, code: string) {
        const key = `verification:${username}`;

        await redisProvider.client.hset(key, 'code', code);
        await redisProvider.client.expire(key, 86400); // expires in 24 hours
    }
}

const tokenHelper = new TokenHelper();

export default tokenHelper;
