import { Task } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import databaseProvider from '@providers/database.provider';
import logger from '@utils/logger';

type TaskEntry = {
    name: string;
    description: string;
    category: 'TODO' | 'IN_PROGRESS' | 'TESTING' | 'COMPLETED';
    isCompleted: boolean;
    dueOn: Date;
    createdAt: Date;
};

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

    async createPersonalTask(userId: number, entry: TaskEntry) {
        try {
            await this.dbClient.task.create({
                data: {
                    userId,
                    name: entry.name,
                    description: entry.description,
                    category: entry.category,
                    dueOn: entry.dueOn,
                    createdAt: entry.createdAt,
                    isCompleted: entry.isCompleted,
                },
            });
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
