import http from '@constants/http';
import { BadRequestError } from '@errors/badrequest.error';
import { UnauthorizedRequestError } from '@errors/unauthorized.error';
import tasksHelper from '@helpers/tasks.helper';
import userHelper from '@helpers/user.helper';
import { Task } from '@prisma/client';
import { extractBearerToken } from '@utils/bearer';
import logger from '@utils/logger';
import { isPermitted } from '@utils/permissions';
import { sanitize } from '@utils/sanitizer';
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
    const bearerToken = extractBearerToken(req);

    if (!bearerToken) {
        throw new UnauthorizedRequestError('Unauthorized, request denied.');
    }

    // The user making this request must have the right token
    if (!(await isPermitted(bearerToken, username))) {
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
    const thisUserTasks = (await tasksHelper.findUserTasksByUserId(
        thisUser.id
    )) as Task[];

    const sanitizedData = [];

    // Sanitize entries
    for (const userTask of thisUserTasks) {
        sanitizedData.push(sanitize(userTask, ['teamId', 'userId']));
    }

    res.status(http.OK).json({
        status: 'success',
        message: 'Fetched user tasks.',
        data: sanitizedData,
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

    // Extract bearer token and ensure validity.
    const bearerToken = extractBearerToken(req);

    if (!bearerToken) {
        throw new UnauthorizedRequestError('Unauthorized, request denied.');
    }

    // Check permissions
    if (!(await isPermitted(bearerToken, username))) {
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

/**
 * Updates personal tasks for a user.
 *
 * @param req Request object.
 * @param res Response object.
 * @param next Express Next Function.
 */
export async function updatePersonalTask(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { username } = req.params;
    const { tasks } = req.body;

    // Again, decoding the provided token, username must match
    const bearerToken = extractBearerToken(req);

    if (!bearerToken) {
        throw new UnauthorizedRequestError('Unauthorized, request denied.');
    }

    // The user making this request must have the right token
    if (!(await isPermitted(bearerToken, username))) {
        throw new UnauthorizedRequestError(
            'You do not have permission to make this request.'
        );
    }

    // Db tx to update tasks here
    await tasksHelper.updatePersonalTask(tasks);
    logger.info(`Successfully batch updated personal tasks for: ${username}.`);

    res.status(http.OK).json({
        status: 'success',
        message: 'User tasks updated successfully.',
    });
}

export async function deletePersonalTask(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { username } = req.params;
    const { id } = req.query;

    // Again, decoding the provided token, username must match
    const bearerToken = extractBearerToken(req);

    if (!bearerToken) {
        throw new UnauthorizedRequestError('Unauthorized, request denied.');
    }

    // The user making this request must have the right token
    if (!(await isPermitted(bearerToken, username))) {
        throw new UnauthorizedRequestError(
            'You do not have permission to make this request.'
        );
    }

    // DB tx to delete specific task
    await tasksHelper.deletePersonalTask(parseInt(id as string, 10));

    logger.info(`Successfully deleted tasks for user: ${username}`);

    res.status(http.OK).json({
        status: 'success',
        message: 'Deleted personal task successfully.',
    });
}
