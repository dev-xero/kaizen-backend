import { NextFunction, Request, Response } from 'express';

import http from '@constants/http';
import { makeURLSafe, obfuscateEmail } from '@utils/transformer';
import userHelper from '@helpers/user.helper';
import { BadRequestError } from '@errors/badrequest.error';
import passwordHelper from '@helpers/password.helper';
import tokenHelper from '@helpers/token.helper';
import { InternalServerError } from '@errors/internal.error';
import logger from '@utils/logger';
import emailHelper from '@helpers/email.helper';
import { sanitize } from '@utils/sanitizer';

/**
 * Processes signup requests.
 *
 * Starts by converting username to a url friendly format, then checks if account
 * duplicates exist, if so, the request is terminated.
 *
 * After the checks, the password is hashed then the user object is saved to the
 * database. We generate a verification link and send that to the user email.
 *
 * If everything is successful, we return a 201 with the obfuscated email address.
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
        },
    });
}

/**
 * Processes sign in requests.
 *
 * Firstly, we check if the user with this email exists.
 * Then we compare the passwords to check if they match.
 *
 * If password matches, check to see if the user is email verified.
 *
 * If these checks pass, then we generate access and refresh tokens and log the user in.
 *
 * @param req Request object
 * @param res Response object
 * @param next Next function
 */
export async function signin(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    const existingUser = await userHelper.findUserWithEmail(email);

    // Check if the user exists
    if (!existingUser) {
        throw new BadRequestError("This user doesn't exist, sign up instead.");
    }

    // Compare password with hash
    const passwordsMatch = passwordHelper.matches(
        existingUser.password,
        password
    );

    if (!passwordsMatch) {
        throw new BadRequestError('Password mismatch.');
    }

    // Check if the user is email verified
    if (!existingUser.isEmailVerified) {
        // send new verification code
        await sendVerificationEmail(existingUser.username, existingUser.email);

        res.status(http.UNAUTHORIZED).json({
            status: 'unauthorized',
            message: 'A new code has been sent to verify your email address.',
            code: http.UNAUTHORIZED,
        });

        return;
    }

    // The password matches, so generate tokens and save refresh token
    const [accessToken, refreshToken] = tokenHelper.generateTokens(
        existingUser.username,
        true
    );

    // Both tokens must have been generated
    if (!(accessToken && refreshToken)) {
        throw new InternalServerError(
            'Failed to generate both access and refresh tokens.'
        );
    }

    // Save the refresh token
    await tokenHelper.saveRefreshToken(existingUser.username, refreshToken);

    // Update last active to the present time
    await userHelper.updateUser(
        { email },
        {
            lastActive: new Date(),
        }
    );

    res.status(http.OK).json({
        status: 'success',
        message: 'Successfully signed in.',
        code: http.OK,
        data: {
            accessToken,
            refreshToken,
            ...sanitize(existingUser, ['id', 'password', 'joinedOn']),
        },
    });
}

// -- UTILITIES / AUTH SPECIFIC HELPERS -- //

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
