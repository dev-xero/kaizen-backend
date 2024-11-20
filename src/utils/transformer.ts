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
