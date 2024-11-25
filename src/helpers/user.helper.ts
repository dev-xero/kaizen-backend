import { env } from '@config/variables';
import { InternalServerError } from '@errors/internal.error';
import { Prisma, User } from '@prisma/client';

import databaseProvider from '@providers/database.provider';
import logger from '@utils/logger';
import crypto from 'node:crypto';
import tokenHelper from './token.helper';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

type UniqueIdentifier = {
    id?: number;
    email?: string;
    username?: string;
};

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
            if (!(err instanceof PrismaClientKnownRequestError)) {
                logger.error(err);
                throw err;
            }

            return false;
        }
    }

    /**
     * Creates a new user record.
     *
     * @param newUser Credentials of the user to create
     * @returns A user record which sensitive details should be omitted from
     */
    public async createUser(newUser: Partial<User>): Promise<User | null> {
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
            if (!(err instanceof PrismaClientKnownRequestError)) {
                logger.error(err);
                throw err;
            }

            return null;
        }
    }

    /**
     * Queries the database for a user with the specified email address.
     *
     * @param email Email address to query with.
     * @returns A user row obj with this email address if it exists, null otherwise.
     */
    public async findUserWithEmail(email: string): Promise<User | null> {
        try {
            const record = await this.dbClient.user.findUnique({
                where: { email },
            });

            return record;
        } catch (err) {
            if (!(err instanceof PrismaClientKnownRequestError)) {
                logger.error(err);
                throw err;
            }
            return null;
        }
    }

    /**
     * Updates the user row with the specified details.
     *
     * @param where Unique identifier for the user (either id, username or email).
     * @param newDetails Details to update.
     * @returns Promises an updated user object.
     */
    public async updateUser(
        where: UniqueIdentifier,
        newDetails: Partial<User>
    ): Promise<User | null> {
        try {
            if (!where.username && !where.email) {
                throw new InternalServerError(
                    'Username or email should at least be specified.'
                );
            }

            const validatedWhere: Prisma.UserWhereUniqueInput = {
                id: where.id,
                username: where.username,
                email: where.email,
            };

            const record = await this.dbClient.user.update({
                where: validatedWhere,
                data: newDetails,
            });

            return record;
        } catch (err) {
            if (!(err instanceof PrismaClientKnownRequestError)) {
                logger.error(err);
                throw err;
            }

            return null;
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
            await tokenHelper.saveEmailVerificationCode(
                username,
                verificationCode
            );

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
