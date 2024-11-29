import { UnauthorizedRequestError } from '@errors/unauthorized.error';
import { NextFunction, Request, Response } from 'express';

import tokenHelper from '@helpers/token.helper';

async function authorized(req: Request, res: Response, next: NextFunction) {
    if (
        !req.headers.authorization ||
        !req.headers.authorization.startsWith('Bearer ')
    ) {
        throw new UnauthorizedRequestError('This endpoint is protected.');
    }

    // Verify the sent token
    const bearerToken = req.headers.authorization.split('Bearer ')[1];
    const decoded = await tokenHelper.verityToken(bearerToken);

    // Token must be valid
    if (!decoded) {
        throw new UnauthorizedRequestError('Token expired or blacklisted.');
    }

    next();
}

export default authorized;
