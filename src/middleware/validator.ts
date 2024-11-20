import { BadRequestError } from '@errors/badrequest.error';
import { extractJoiMessage } from '@utils/transformer';
import { NextFunction, Request, Response } from 'express';
import { ObjectSchema } from 'joi';

// This middleware is responsible for validating request body schemas
// before passing them to their handlers
function validated(schema: ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.body) {
            throw new BadRequestError(
                'Provide request body for this endpoint.'
            );
        }

        const result = schema.validate(req.body);

        if (result.error) {
            const errorMessage = extractJoiMessage(result);

            throw new BadRequestError(errorMessage);
        }

        next();
    };
}

export default validated;
