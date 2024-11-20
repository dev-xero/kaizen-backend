import { InternalServerError } from '@errors/internal.error';
import { User } from '@prisma/client';
import databaseProvider from '@providers/database.provider';
import logger from '@utils/logger';

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
}

const userHelper = new UserHelper();

export default userHelper;
