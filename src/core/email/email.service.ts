import { env } from '@config/variables';
import { BadRequestError } from '@errors/badrequest.error';
import { InternalServerError } from '@errors/internal.error';
import tokenHelper from '@helpers/token.helper';
import userHelper from '@helpers/user.helper';
import { NextFunction, Request, Response } from 'express';

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

    if (!(username && code)) {
        throw new BadRequestError('URL is malformed.');
    }

    const savedVerificationCode = await tokenHelper.getEmailVerificationCode(
        username as string
    );

    if (savedVerificationCode != code) {
        throw new BadRequestError('Email not verified.');
    }

    // Update user to become verified
    await userHelper.updateUser(
        { username: username as string },
        {
            isEmailVerified: true,
        }
    );

    // delete verification code
    await tokenHelper.deleteVerificationCode(username as string);

    const clientURL = env.app.clientURL;

    if (!clientURL) {
        throw new InternalServerError('Client URL key is missing.');
    }

    const [_, accessToken] = tokenHelper.generateTokens(
        username as string,
        true
    );

    res.redirect(`${clientURL}/auth/signin?token=${accessToken}`);
}
