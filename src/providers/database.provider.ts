import { PrismaClient } from '@prisma/client';
import logger from '@utils/logger';

class DatabaseProvider {
    private prismaClient: PrismaClient;

    constructor() {
        this.prismaClient = new PrismaClient();
    }

    public get client() {
        return this.prismaClient;
    }

    public async connect() {
        await this.prismaClient.$connect().catch((err) => {
            logger.error('Database connection failed.');
            throw err;
        });

        logger.info('Database connected successfully.');
    }
}

const databaseProvider = new DatabaseProvider();

export default databaseProvider;
