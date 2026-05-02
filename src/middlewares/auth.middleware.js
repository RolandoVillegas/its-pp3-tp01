// auth.middleware.js
import passport from "../configuration/passport.js";

function authMiddleware(req, res, next) {
  return passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      console.error("Error en autenticación:", err);
      return res.status(500).json({
        ok: false,
        error: { message: "Error interno de autenticación" },
      });
    }
    
    if (!user) {
      console.log("Usuario no autenticado:", info);
      return res.status(401).json({
        ok: false,
        error: {
          message: "No autorizado",
          detail: info?.message || "Token inválido o expirado"
        },
      });
    }
    
    req.user = user;
    next();
  })(req, res, next);
}

export default authMiddleware;
