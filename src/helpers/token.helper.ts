import { env } from '@config/variables';
import { InternalServerError } from '@errors/internal.error';

import redisProvider from '@providers/redis.provider';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

class TokenHelper {
    constructor() {}

    /**
     * Generates a refresh and optionally access token from a username and id.
     *
     * @param id User id to sign the jwt with.
     * @param username Username to sign tokens with.
     * @param withAccess Boolean specifying whether to generate a signed access token with it.
     * @returns An array containing the refresh token and/or access token.
     */
    public generateTokens(id: number, username: string, withAccess = false) {
        if (!env.tokens.accessKey || !env.tokens.refreshKey) {
            throw new InternalServerError(
                'Access or refresh token secret key is missing.'
            );
        }

        const payload = { id, username };
        let accessToken = null;

        if (withAccess) {
            accessToken = jwt.sign(payload, env.tokens.accessKey, {
                expiresIn: '1h',
            });
        }

        const refreshToken = crypto
            .createHash('sha-256')
            .update(`${env.tokens.refreshKey}@${username}:${Date.now()}`)
            .digest('base64url');

        return withAccess ? [accessToken, refreshToken] : [refreshToken];
    }

    /**
     * Verifies access tokens for sensitive endpoints.
     *
     * @param accessToken Access token to verify.
     * @returns The jwt payload if the access token is valid.
     */
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

    /**
     * Asynchronously attempts to retrieve a saved refresh token for a user.
     *
     * @param username Username to query for.
     * @returns Refresh token for the user if it exists, null otherwise.
     */
    public async retrieveRefreshToken(
        username: string
    ): Promise<string | null> {
        return await redisProvider.client.get(username);
    }

    /**
     * Asynchronously saves a refresh token to redis.
     *
     * @param username Username to save the refresh token with.
     * @param token Token value.
     */
    public async saveRefreshToken(username: string, token: string) {
        const key = `refresh:${username}`;

        await redisProvider.client.hset(key, username, token);
        await redisProvider.client.expire(key, 172800); // expires in 2 days
    }

    /**
     * Asynchronously saves an email verification code to redis, mapped to a username.
     *
     * @param username Username to save the code with.
     * @param code Email verification code.
     */
    public async saveEmailVerificationCode(username: string, code: string) {
        const key = `verification:${username}`;

        await redisProvider.client.hset(key, 'code', code);
        await redisProvider.client.expire(key, 86400); // TTL is 24 hours
    }

    /**
     * Asynchronously retrieves an email verification code from redis.
     *
     * @param username Username the code was saved with.
     * @returns A string representing the code or null if non-existent.
     */
    public async getEmailVerificationCode(
        username: string
    ): Promise<string | null> {
        const key = `verification:${username}`;
        return await redisProvider.client.hget(key, 'code'); // retrieve only the key field
    }

    /**
     * Asynchronously deletes a verification code from redis.
     *
     * @param username Username to delete from.
     */
    public async deleteVerificationCode(username: string) {
        const key = `verification:${username}`;
        await redisProvider.client.del(key);
    }
}

const tokenHelper = new TokenHelper();

export default tokenHelper;
