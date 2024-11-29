import http from '@constants/http';
import { BadRequestError } from '@errors/badrequest.error';
import { UnauthorizedRequestError } from '@errors/unauthorized.error';
import tokenHelper from '@helpers/token.helper';
import userHelper from '@helpers/user.helper';
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
    const decoded = await tokenHelper.verityToken(bearerToken);

    if (decoded.username != username) {
        throw new UnauthorizedRequestError(
            'You do not have permission to make this request.'
        );
    }

    // Get this user
    const thisUser = await userHelper.findUserWithUsername(username);

    if (!thisUser) {
        throw new BadRequestError('No user with this username exists.');
    }

    res.status(http.OK).json({
        status: 'success',
        message: 'Fetched user tasks.',
        data: {},
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
) {}
