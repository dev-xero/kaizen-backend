import http from '@constants/http';
import { BadRequestError } from '@errors/badrequest.error';
import { UnauthorizedRequestError } from '@errors/unauthorized.error';
import tasksHelper from '@helpers/tasks.helper';
import userHelper from '@helpers/user.helper';
import logger from '@utils/logger';
import { isPermitted } from '@utils/permissions';
import { NextFunction, Request, Response } from 'express';

/**
 * Queries the database for tasks owned by this user, returns an empty array if none.
 *
 * @param req Request object.
 * @param res Response object.
 * @param next Express Next Function.
 */
export async function getPersonalTasks(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { username } = req.params;

    // Decoding the provided token, username must match
    const bearerToken = req.headers.authorization!.split('Bearer ')[1];

    // The user making this request must have the right token
    if (! await isPermitted(bearerToken, username)) {
        throw new UnauthorizedRequestError(
            'You do not have permission to make this request.'
        );
    }

    // Get this user, throw an error if the user doesn't exist
    const thisUser = await userHelper.findUserWithUsername(username);

    if (!thisUser) {
        throw new BadRequestError('No user with this username exists.');
    }

    // Collect and then return their tasks
    const thisUsersTasks = await tasksHelper.findUserTasksByUserId(thisUser.id);

    res.status(http.OK).json({
        status: 'success',
        message: 'Fetched user tasks.',
        data: thisUsersTasks,
    });
}

/**
 * Attempts to create a new personal task for a user.
 *
 * @param req Request object.
 * @param res Response object.
 * @param next Express Next Function.
 */
export async function createPersonalTask(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { username } = req.params;
    const { name, description, category, isCompleted, createdAt, dueOn } =
        req.body;

    const bearerToken = req.headers.authorization!.split('Bearer ')[1];

    // Check permissions
    if (! await isPermitted(bearerToken, username)) {
        throw new UnauthorizedRequestError(
            'You do not have permission to make this request.'
        );
    }

    // Get this user, throw an error if the user doesn't exist
    const thisUser = await userHelper.findUserWithUsername(username);

    if (!thisUser) {
        throw new BadRequestError('No user with this username exists.');
    }

    const taskEntry = {
        name,
        description,
        category,
        isCompleted: isCompleted == 'true' || isCompleted == true, // Joi doesn't handle booleans the best way
        createdAt,
        dueOn,
    };

    // Create this task if all checks match
    await tasksHelper.createPersonalTask(thisUser.id, taskEntry);

    logger.info(`Successfully created new task for user: ${username}`);

    res.status(http.CREATED).json({
        status: 'success',
        message: 'Successfully created new task.',
    });
}
