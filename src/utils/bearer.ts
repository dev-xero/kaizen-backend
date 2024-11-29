import { Request } from 'express';

export function extractBearerToken(req: Request): string {
    if (!req.headers || req.headers.authorization?.startsWith('Bearer ')) {
        return '';
    }

    return req.headers.authorization!.split('Bearer ')[1];
}
