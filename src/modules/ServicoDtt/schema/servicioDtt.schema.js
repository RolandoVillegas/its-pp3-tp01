import Joi from "joi";

export const createServicioDttSchema = Joi.object({
    SER: Joi.string().max(50).required(),
    DES: Joi.string().max(255).required(),
    ACT: Joi.string().max(100).valid('S', 'N').required(),
});