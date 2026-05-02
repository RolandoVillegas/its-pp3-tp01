// login.schema.js
import joi from 'joi';

export const loginUsuario = joi.object({
  email: joi.string().email().required(),
  contraseña: joi.string().required(),
});
