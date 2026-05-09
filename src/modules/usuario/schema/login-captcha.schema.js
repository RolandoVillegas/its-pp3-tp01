// TP01 - Defensa DDoS para SGGM V01
// Esquema de validación para el login con CAPTCHA utilizando Joi. 
// Se extiende el esquema de login tradicional agregando el campo captchaToken.

import joi from "joi";

export const loginCaptchaUsuario = joi.object({
  email: joi.string().email().required(),
  contraseña: joi.string().required(),
  captchaToken: joi.string().required(),
});