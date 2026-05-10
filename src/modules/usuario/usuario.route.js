import { Router } from 'express';
import { validate } from '../../middlewares/validator.middleware.js';
import { createUsuarioSchema } from './schema/usuario.schema.js';
import { loginUsuario } from './schema/login.schema.js';
import { register, login, findAll } from './usuario.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';
import { getClientIp } from '../../utils/client-ip.js';


const usuarioRoutes = Router();

const ataquesPorIp = new Map();
const REQUESTS_POR_TRAMO = 5;
const BLOQUEO_BASE_MS = 60 * 1000; // 1 minuto
const VENTANA_TIEMPO_MS = 60 * 1000; // 1 minuto - ventana deslizante

const loginLimiterProgresivo = (req, res, next) => {
  const ahora = Date.now();
  const ip = getClientIp(req);

  const registro = ataquesPorIp.get(ip) || {
    intentos: [], // Array de timestamps de intentos
    nivel: 0,
    bloqueoHasta: 0,
  };

  // Limpiar intentos fuera de la ventana de tiempo (ventana deslizante)
  registro.intentos = registro.intentos.filter(
    (timestamp) => ahora - timestamp < VENTANA_TIEMPO_MS
  );

  if (registro.bloqueoHasta > ahora) {
    const segundosRestantes = Math.ceil((registro.bloqueoHasta - ahora) / 1000);

    registro.intentos.push(ahora); // Registrar intento durante bloqueo
    ataquesPorIp.set(ip, registro);

    return res.status(429).json({
      ok: false,
      error: {
        message: `Demasiados intentos al endpoint de login. Bloqueado por ${segundosRestantes} segundos.`,
      },
      metadata: {
        nivelBloqueo: registro.nivel,
        proximoReinicioEn: Math.ceil((ahora + VENTANA_TIEMPO_MS - Math.min(...registro.intentos)) / 1000),
        requestsPorTramo: REQUESTS_POR_TRAMO,
      },
    });
  }

  registro.intentos.push(ahora);

  if (registro.intentos.length >= REQUESTS_POR_TRAMO) {
    registro.nivel += 1;

    const bloqueoMs = registro.nivel * BLOQUEO_BASE_MS;
    registro.bloqueoHasta = ahora + bloqueoMs;

    ataquesPorIp.set(ip, registro);

    return res.status(429).json({
      ok: false,
      error: {
        message: `Límite excedido. Bloqueado por ${Math.ceil(bloqueoMs / 1000)} segundos.`,
      },
      metadata: {
        nivelBloqueo: registro.nivel,
        proximoReinicioEn: Math.ceil(VENTANA_TIEMPO_MS / 1000),
        requestsPorTramo: REQUESTS_POR_TRAMO,
      },
    });
  }

  ataquesPorIp.set(ip, registro);
  return next();
};

// Protección solo autenticación
const protect = [authMiddleware];

usuarioRoutes.post("/register", validate(createUsuarioSchema), register);
usuarioRoutes.post("/login", loginLimiterProgresivo, validate(loginUsuario), login);
usuarioRoutes.get("/users", ...protect, findAll);

export default usuarioRoutes;
