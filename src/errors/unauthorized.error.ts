import { ApplicationError } from './application.error';

import http from '@constants/http';

// Unauthorized request error wrapper
export class UnauthorizedRequestError extends ApplicationError {
    constructor(message: string = 'Unauthorized.') {
        super(message, http.UNAUTHORIZED);
    }
}
