import { InternalServerError } from '@errors/internal.error';
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

    /**
     * Asynchronously attempts to find all tasks belonging to this user by id.
     *
     * @param id Valid user id.
     */
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

    /**
     * Asynchronously attempts to create a new user task.
     *
     * @param userId Valid user id.
     * @param entry Task entry with validated fields.
     */
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
            }
        }
    }

    /**
     * Asynchronously updates user personal tasks.
     *
     * @param tasks An array of tasks to process.
     */
    async updatePersonalTask(tasks: Task[]) {
        const taskUpdatePromises = tasks.map((task) => {
            const {
                id,
                name,
                description,
                category,
                dueOn,
                createdAt,
                isCompleted,
            } = task;

            return this.dbClient.task.update({
                where: { id },
                data: {
                    name,
                    description,
                    category,
                    isCompleted,
                    createdAt: new Date(createdAt),
                    dueOn: new Date(dueOn),
                },
            });
        });

        try {
            await Promise.all(taskUpdatePromises);
        } catch (err) {
            logger.error(err);
            throw new InternalServerError('Unable to update tasks.');
        }
    }

    async deletePersonalTask(taskId: number) {
        try {
            await this.dbClient.task.delete({
                where: { id: taskId },
            });
        } catch (err) {
            logger.error(err);
            throw new InternalServerError('Unable to update tasks.');
        }
    }
}

const tasksHelper = new TasksHelper();

export default tasksHelper;
