import Joi from 'joi';

// Request body schema for signing in
export const signInSchema = Joi.object({
    password: Joi.string().min(8).required(),
    email: Joi.string().email().required(),
});
