import { env } from '@config/variables';
import { InternalServerError } from '@errors/internal.error';
import { User } from '@prisma/client';

import databaseProvider from '@providers/database.provider';
import redisProvider from '@providers/redis.provider';
import logger from '@utils/logger';
import crypto from 'node:crypto';
import tokenHelper from './token.helper';

class UserHelper {
    private dbClient = databaseProvider.client;

    constructor() {}

    /**
     * Promises a boolean indicating whether a record with this username or email
     * already exists.
     *
     * @param username username to check for
     * @param email email address to check for
     */
    public async alreadyExists(
        username: string,
        email: string
    ): Promise<boolean> {
        try {
            const record = await this.dbClient.user.findFirst({
                where: {
                    OR: [{ email }, { username }],
                },
            });

            return record != null;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    /**
     * Creates a new user record.
     *
     * @param newUser Credentials of the user to create
     * @returns A user record which sensitive details should be omitted from
     */
    public async createUser(newUser: Partial<User>): Promise<User> {
        try {
            if (!(newUser.username && newUser.password && newUser.email)) {
                throw new InternalServerError(
                    'Provide all of username, email and password for the new user.'
                );
            }

            const record = await this.dbClient.user.create({
                data: {
                    username: newUser.username,
                    email: newUser.email,
                    password: newUser.password,
                    isEmailVerified: false,
                    joinedOn: new Date(),
                    lastActive: new Date(),
                },
            });

            return record;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    /**
     * Generates a unique verification link for a user and saves it to redis.
     * The link expires in 24 hours.
     *
     * @param username Username of the user to generate for.
     */
    public async generateVerificationLink(username: string): Promise<string> {
        const emailKey = env.tokens.emailKey;
        const deployedURL = env.app.deployedURL;

        if (!emailKey) {
            throw new InternalServerError(
                'Email verification secret not configured.'
            );
        }

        if (!deployedURL) {
            throw new InternalServerError(
                'Deployed url secret not configured.'
            );
        }

        const verificationCode = crypto.randomBytes(32).toString('base64url'); // eliminate predictability

        try {
            // Save this verification code to redis
            await tokenHelper.saveVerificationCode(username, verificationCode);

            logger.info('Successfully generated user verification code.');

            const verificationEmail = `${deployedURL}/email/verify?username=${username}&code=${verificationCode}`;

            return verificationEmail;
        } catch (err) {
            logger.error(err);
            throw new InternalServerError('Failed to save verification code.');
        }
    }
}

const userHelper = new UserHelper();

export default userHelper;
