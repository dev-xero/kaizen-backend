import http from '@constants/http';
import { BadRequestError } from '@errors/badrequest.error';
import { UnauthorizedRequestError } from '@errors/unauthorized.error';
import userHelper from '@helpers/user.helper';
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

    const thisUserRecord = await userHelper.findUserWithUsername(username);

    // If the username provided somehow doesn't exist, terminate the request.
    if (!thisUserRecord) {
        throw new BadRequestError('No user with this username exists.');
    }

    // All checks pass
    res.status(http.OK).json({
        status: 'success',
        message: 'Successfully fetched user record.',
        data: sanitize(thisUserRecord, ['password', 'id']),
    });
}
