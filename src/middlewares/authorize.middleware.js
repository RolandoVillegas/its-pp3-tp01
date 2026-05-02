/**
 * Middleware de autorización por rol.
 * Permite pasar si el rol del usuario está dentro de los permitidos.
 */

function authorize(...allowedRoles) {
  // Para evitar problemas, se normaliza la lista de roles permitidos,
  // todo en minúsculas y sin espacios.
  const allowed = allowedRoles.map((r) => String(r).trim().toLowerCase());

  return (req, res, next) => {
    // Verifica que el usuario esté autenticado
    // (req.user viene de auth.middleware + passport)
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        error: { message: "No autorizado" },
      });
    }

    // Buscar el primer valor de rol que no sea nulo ni undefined
    const rolCrudo = req.user.role ?? req.user.rol ?? "";

    console.log(rolCrudo);
    // y luego lo normaliza
    const userRole = String(rolCrudo).trim().toLowerCase();

    // Finalmente, si no hay un rol autorizado, rechaza e informa status 403.
    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        ok: false,
        error: { message: "Prohibido: privilegios insuficientes (rol)." },
      });
    }

    next();
  };
}

export default authorize;
