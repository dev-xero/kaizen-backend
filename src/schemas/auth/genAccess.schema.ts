import Joi from 'joi';

// Request body schema for generating access tokens
export const genAccessSchema = Joi.object({
    refresh: Joi.string().required(),
});
