import { Task } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import databaseProvider from '@providers/database.provider';
import logger from '@utils/logger';

/**
 *  This class is provides utilities to abstract querying the tasks table from the database.
 */
class TasksHelper {
    private dbClient = databaseProvider.client;

    constructor() {}

    async findUserTasksByUserId(id: number): Promise<Task[] | null> {
        try {
            const record = await this.dbClient.task.findMany({
                where: { userId: id },
            });

            return record;
        } catch (err) {
            if (!(err instanceof PrismaClientKnownRequestError)) {
                logger.error(err);
                throw err;
            } else {
                return null;
            }
        }
    }
}

const tasksHelper = new TasksHelper();

export default tasksHelper;
