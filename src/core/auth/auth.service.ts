import http from '@constants/http';
import { NextFunction, Request, Response } from 'express';

export async function signup(req: Request, res: Response, next: NextFunction) {
    res.status(http.OK).json({
        status: 'success',
        message: 'Yet to be implemented.',
    });
}
