import { Request } from 'express';

export function extractBearerToken(req: Request): string | null {
    if (!req.headers || !req.headers.authorization?.startsWith('Bearer ')) {
        return null;
    }

    return req.headers.authorization!.split('Bearer ')[1];
}
