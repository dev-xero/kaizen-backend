import http from '@constants/http';
import { BadRequestError } from '@errors/badrequest.error';
import { UnauthorizedRequestError } from '@errors/unauthorized.error';
import tokenHelper from '@helpers/token.helper';
import userHelper from '@helpers/user.helper';
import { Task, User } from '@prisma/client';
import { extractBearerToken } from '@utils/bearer';
import { isPermitted } from '@utils/permissions';
import { sanitize } from '@utils/sanitizer';
import { NextFunction, Request, Response } from 'express';

/**
 * Validates the request by ensuring the user making this request is authorized via jwt.
 * Then queries the database for this user's information.
 *
 * @param req Request object.
 * @param res Response object.
 * @param next Express next function.
 */
export async function getUserInformation(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { username } = req.params;

    // Username must be present from the request parameters.
    if (!username) {
        throw new BadRequestError('Malformed request, username is required.');
    }

    const bearerToken = extractBearerToken(req);

    // If for whatever reason the bearer token is not present, deny the request.
    if (!bearerToken) {
        throw new UnauthorizedRequestError('Unauthorized, request denied.');
    }

    // The verified jwt username (decoded) must match this username
    if (!(await isPermitted(bearerToken, username))) {
        throw new UnauthorizedRequestError(
            'You do not have permission to complete this request.'
        );
    }

    const { id } = await tokenHelper.verityToken(bearerToken);

    // Database transaction query to combine user information and task data.
    let thisUserRecord = await userHelper.getUserInformationFromId(id);

    // If the username provided somehow doesn't exist, terminate the request.
    if (!thisUserRecord) {
        throw new BadRequestError('No user with this username exists.');
    }

    const sanitizedTasks = [];

    // Remove id fields from each task.
    for (const task of thisUserRecord.tasks) {
        sanitizedTasks.push(sanitize(task, ['id', 'userId', 'teamId']));
    }

    // Cleaned up data safe for consumption.
    const sanitizedData = {
        username: thisUserRecord.username,
        isEmailVerified: thisUserRecord.isEmailVerified,
        joinedOn: thisUserRecord.joinedOn,
        lastActive: thisUserRecord.joinedOn,
        tasks: sanitizedTasks,
    };

    // All checks pass
    res.status(http.OK).json({
        status: 'success',
        message: 'Successfully fetched user record.',
        data: sanitizedData,
    });
}
