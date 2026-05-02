// src/modules/novedad/novedad.schema.js
import joi from "joi";

const DIA_VALUES = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
];

export const createNovedadSchema = joi
  .object({
    id_profesional: joi.string().max(7).required().messages({
      "any.required": "El código de profesional (id_profesional) es obligatorio.",
    }),

    fechahora_inicio_guardia: joi.date().iso().required(),
    fechahora_fin_guardia: joi.date().iso().required(),

    observaciones: joi.string().max(255).allow(null, ""),

    servicio_id: joi.number().integer().positive().required(),
  })
  .custom((value, helpers) => {

    const { fechahora_inicio_guardia, fechahora_fin_guardia } = value;
    if (new Date(fechahora_fin_guardia) <= new Date(fechahora_inicio_guardia)) {
      return helpers.error(
        "any.invalid",
        "La fecha y hora de finalización debe ser posterior al inicio."
      );
    }
    return value;
  }, "validación de rango temporal");

// PATCH parcial
export const updateNovedadSchema = joi
  .object({
    id_profesional: joi.string().max(7),
    fechahora_inicio_guardia: joi.date().iso(),
    fechahora_fin_guardia: joi.date().iso(),
    observaciones: joi.string().max(255).allow(null, ""),
    eliminado: joi.boolean(), // opcionalmente permitir toggling controlado
    servicio_id: joi.number().integer().positive().optional(),
  })
  .custom((value, helpers) => {
    // Si vienen ambas fechas, validar orden.
    if (value.fechahora_inicio_guardia && value.fechahora_fin_guardia) {
      if (
        new Date(value.fechahora_fin_guardia) <=
        new Date(value.fechahora_inicio_guardia)
      ) {
        return helpers.error(
          "any.invalid",
          "La fecha y hora de finalización debe ser posterior al inicio."
        );
      }
    }
    return value;
  }, "validación de rango temporal")
  .min(1); // evita PATCH vacío
