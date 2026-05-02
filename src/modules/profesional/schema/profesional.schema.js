import joi from "joi";

// Alta de profesional
export const createProfesionalSchema = joi.object({
  PRF: joi.string().max(7).required().messages({
    "any.required": "PRF es obligatorio",
  }),
  NOM: joi.string().max(40).required(),
  ACT: joi.string().valid("S", "N").required(),
});

// Update parcial (PATCH)
export const updateProfesionalSchema = joi
  .object({
    NOM: joi.string().max(40),
    ACT: joi.string().valid("S", "N"),
  })
  .min(1); // evita PATCH vacío
