import Joi from "joi";

export const createServicioSchema = Joi.object({
    nombre: Joi.string().max(100).required(),
    ubicacion: Joi.string().max(255).valid("SRN Cipolletti", "SRN Cinco Saltos").required(),
    servicio_cod_datatech: Joi.string().max(50).optional().allow(null, ""),
    fecha_cierre: Joi.date().iso().required(),
    coordinador_usuario_id: Joi.number().integer().positive().optional().allow(null),
    eliminado: Joi.forbidden(),
});

