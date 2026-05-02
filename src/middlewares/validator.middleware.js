/**
 * Middleware genérico de validación.
 *
 * Valida el body de la solicitus antes que llegue al controlador.
 * Si los datos son válidos, continúa con el siguiente middleware, de lo
 * contrario devuelve un status 400 Bad request.
 *
 */

export const validate = (dto) => (req, res, next) => {
  // dto=esquema de validación de joi.
  const { error } = dto.validate(req.body);

  // Si joi detenta un error en el body, se interrumple la ejecución y
  // se devuelve status 400 Bad request con los detalles de la validación.
  if (error)
    return res.status(400).json({
      error: error.details,
    });

  // Si todo está bien se continúa al siguiente middleware (o controlador).
  next();
};
