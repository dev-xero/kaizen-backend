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
}

const userHelper = new UserHelper();

export default userHelper;
