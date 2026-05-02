// user.schema.js
import joi from "joi";

export const createUsuarioSchema = joi.object({
  contraseña: joi.string().min(8).max(255).required(),
  email: joi.string().min(2).max(30).required(),
  role: joi.string().valid("admin", "user", "coordinador", "administrativo", "rrhh").required(),
  nombre: joi.string().max(100).optional().allow(null, ""),
  apellido: joi.string().max(100).optional().allow(null, ""),
  Creado: joi.date().optional(),
});

