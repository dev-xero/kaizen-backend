import { ValidationResult } from 'joi';

/**
 * This function takes in a joi validation result and returns string escaped
 * error messages.
 * @param result Joi validation result.
 */
export function extractJoiMessage(result: ValidationResult): string {
    if (!result.error) return '';

    const { message, path } = result.error.details[0];
    const field = path.join('.');
    const formattedMessage = message.replace(/"/g, ''); // remove quotes

    return `${field} field ${formattedMessage.replace(field, '').trim()}.`;
}

/**
 * Removes special characters and replaces spaces to make strings
 * URL-friendly.
 *
 * @param unsafe Unsafe string.
 * @returns A url-safe string equivalent.
 */
export function makeURLSafe(unsafe: string): string {
    const safeString = unsafe;

    safeString
        .toLowerCase()
        .replace(/[^a-zA-Z ]/g, '')
        .trim()
        .replace(/ /g, '-');

    return safeString;
}

/**
 * Replaces character in an email with asterisks to improve
 * anonymity.
 *
 * @param email Email to obfuscate.
 * @returns An obfuscated email.
 */
export function obfuscateEmail(email: string): string {
    const namePart = email.split('@')[0];
    const domainPart = email.split('@')[1];

    const obfuscationLength = Math.max(0, Math.min(namePart.length - 3, 3));

    const obfuscatedNamePart = `${namePart.slice(
        0,
        obfuscationLength
    )}${'*'.repeat(namePart.length - obfuscationLength)}`;

    const obfuscatedEmail = `${obfuscatedNamePart}@${domainPart}`;

    return obfuscatedEmail;
}
