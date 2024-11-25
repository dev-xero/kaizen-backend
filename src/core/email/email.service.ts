import { env } from '@config/variables';
import { BadRequestError } from '@errors/badrequest.error';
import { InternalServerError } from '@errors/internal.error';
import { NextFunction, Request, Response } from 'express';

import tokenHelper from '@helpers/token.helper';
import userHelper from '@helpers/user.helper';
import logger from '@utils/logger';

/**
 * Processes email verification requests.
 *
 * Firstly check if the username and code is present in the request.
 * Compare this token with the saved verification code, if they match,
 * verify the user.
 *
 * @param req Request object
 * @param res Response object
 * @param next Next function
 */
export async function verify(req: Request, res: Response, next: NextFunction) {
    const { username, code } = req.query;
    const clientURL = env.app.clientURL;

    if (!(username && code)) {
        res.redirect(`${clientURL}/email/notverified`);
        logger.warn('url is malformed, denying verification.');
        return;
    }

    if (!clientURL) {
        throw new InternalServerError(
            'Client URL key is missing or not configured.'
        );
    }

    const savedVerificationCode = await tokenHelper.getEmailVerificationCode(
        username as string
    );

    if (savedVerificationCode != code) {
        res.redirect(`${clientURL}/email/notverified`);
        logger.warn('verification code mismatch, denying verification.');
        return;
    }

    // Update user to become verified
    await userHelper.updateUser(
        { username: username as string },
        {
            isEmailVerified: true,
        }
    );

    // Delete verification code
    await tokenHelper.deleteVerificationCode(username as string);

    res.redirect(`${clientURL}/auth/login`);
}
