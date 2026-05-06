import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../../middlewares/validator.middleware.js';
import { createUsuarioSchema } from './schema/usuario.schema.js';
import { loginUsuario } from './schema/login.schema.js';
import { register, login, findAll } from './usuario.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';


const usuarioRoutes = Router();

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto de bloqueo
  max: 5, // Máximo 5 intentos por IP cada minuto
  message: {
    status: 429,
    message: 'Demasiados intentos de inicio de sesión. Bloqueado por 1 minuto.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Protección solo autenticación
const protect = [authMiddleware];

usuarioRoutes.post("/register", validate(createUsuarioSchema), register);
usuarioRoutes.post("/login", loginLimiter, validate(loginUsuario), login);
usuarioRoutes.get("/users", ...protect, findAll);

export default usuarioRoutes;
