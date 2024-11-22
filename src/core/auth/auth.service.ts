import { NextFunction, Request, Response } from 'express';

import http from '@constants/http';
import { makeURLSafe, obfuscateEmail } from '@utils/transformer';
import userHelper from '@helpers/user.helper';
import { BadRequestError } from '@errors/badrequest.error';
import passwordHelper from '@helpers/password.helper';
import tokenHelper from '@helpers/token.helper';
import { InternalServerError } from '@errors/internal.error';
import logger from '@utils/logger';
import { sanitize } from '@utils/sanitizer';
import emailHelper from '@helpers/email.helper';

/**
 * Processes signup requests.
 *
 * Starts by converting username to a url friendly format, then checks if account
 * duplicates exist, if so, the request is terminated.
 *
 * Hashes the user password afterwards then generates an access and refresh token
 * which are then returned to the user.
 *
 * @param req Request object
 * @param res Response object
 * @param next Next function
 */
export async function signup(req: Request, res: Response, next: NextFunction) {
    const { username, email, password } = req.body;

    const urlSafeUsername = makeURLSafe(username);

    // Check for duplicates
    const duplicateExists = await userHelper.alreadyExists(
        urlSafeUsername,
        email
    );

    if (duplicateExists) {
        throw new BadRequestError(
            'A user with this credentials already exists, sign in instead.'
        );
    }

    // Hash user password
    const hashedPassword = passwordHelper.hash(password);

    // Create the user
    await userHelper.createUser({
        username: urlSafeUsername,
        password: hashedPassword,
        email,
    });

    // Generate tokens
    const [accessToken, refreshToken] =
        tokenHelper.generateTokens(urlSafeUsername);

    // These tokens must have been generated
    if (!(accessToken && refreshToken)) {
        throw new InternalServerError('Failed to generate user tokens.');
    }

    // Save refresh token to redis
    await tokenHelper.saveRefreshToken(urlSafeUsername, refreshToken);

    // Generate verification link and send email
    await sendVerificationEmail(urlSafeUsername, email);

    // Request is complete
    logger.info('Successfully registered a new user.');

    res.status(http.CREATED).json({
        status: 'success',
        message: 'Successfully signed up, please verify your email address.',
        code: http.CREATED,
        data: {
            obfuscatedEmail: obfuscateEmail(email),
            accessToken,
            refreshToken,
        },
    });
}

// Generates and sends a verification email after sign up.
async function sendVerificationEmail(name: string, email: string) {
    const verificationLink = await userHelper.generateVerificationLink(name);
    const recipients = [{ email, name }];
    const subject = `Welcome to Kaizen ${name}!`;

    const templateData = { username: name, verificationLink };

    await emailHelper.sendUserVerificationEmail(
        recipients,
        subject,
        templateData
    );
}
