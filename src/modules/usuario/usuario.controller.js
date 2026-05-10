import { request, response } from "express";
import * as bcrypt from "bcrypt";
import AppDatasource from "../../providers/datasource.provider.js";
import { envs } from "../../configuration/envs.js";
import jwt from "jsonwebtoken";
import { createLogger } from "../../logging/logger.js";
import { getClientIp } from "../../utils/client-ip.js";

const repo = () => AppDatasource.getRepository("Usuario");
const loginIntentoRepo = () => AppDatasource.getRepository("LoginIntento");

const log = createLogger("usuario");

const register = async (req = request, res = response) => {
  const { email, contraseña, nombre, apellido, ...data } = req.body;
  const endpoint = req.originalUrl || req.url;
  const clientIp = getClientIp(req);

  try {
    // Verificación si ya existe email (dos usuarios no pueden tener
    // el mismo email, pues se utiliza como credencial de acceso.)
    const exists = await repo().findOne({ where: { email } });

    if (exists) {
      await log(req, {
        level: "INFO",
        user: req.user?.email || "anon",
        message: `USUARIO_REGISTER_FAILED reason=EMAIL_ALREADY_EXISTS endpoint=${endpoint} ip=${clientIp} email=${email}`,
      });

      return res.status(409).json({
        ok: false,
        error: { message: "Este Email ya ha sido registrado." },
      });
    }

    const hashContraseña = await bcrypt.hash(contraseña, 12);

    const newUsuario = await repo().save({
      ...data,
      email,
      contraseña: hashContraseña,
      nombre: nombre || null,
      apellido: apellido || null,
    });

    const { contraseña: _p, ...safe } = newUsuario;

    await log(req, {
      level: "INFO",
      user: req.user?.email || email || "anon",
      message: `USUARIO_REGISTER_SUCCESS endpoint=${endpoint} ip=${clientIp} userId=${newUsuario.id} email=${newUsuario.email} role=${newUsuario.role}`,
    });

    return res.status(201).json({
      ok: true,
      message: "Usuario creado con éxito.",
      usuario: safe,
    });
  } catch (error) {
    await log(req, {
      level: "INFO",
      user: req.user?.email || email || "anon",
      message: `USUARIO_REGISTER_ERROR endpoint=${endpoint} ip=${clientIp} email=${email || "sin_email"} error=${error?.message}`,
    });

    return res.status(400).json({
      ok: false,
      error: {
        message: "El usuario no pudo ser creado.",
        detail: error?.message,
      },
    });
  }
};

const login = async (req = request, res = response) => {
  const { email, contraseña } = req.body;
  const endpoint = req.originalUrl || req.url;
  const clientIp = getClientIp(req);

  try {
    const loginRepo = loginIntentoRepo();
    let registro = await loginRepo.findOne({ where: { ip: clientIp } });

    if (!registro) {
      registro = loginRepo.create({
        ip: clientIp,
        intentos: 0,
        intentosBloqueado: 0,
        bloqueoHasta: null,
      });
    }

    const bloqueoActivoHasta = registro.bloqueoHasta
      ? new Date(registro.bloqueoHasta).getTime()
      : null;

    if (bloqueoActivoHasta && bloqueoActivoHasta > Date.now()) {
      // Castigo progresivo: cada intento durante bloqueo suma +30s sobre el bloqueo vigente
      registro.intentosBloqueado = (registro.intentosBloqueado || 0) + 1;
      const segundosAdicionales = registro.intentosBloqueado * 30;
      registro.bloqueoHasta = new Date(
        bloqueoActivoHasta + segundosAdicionales * 1000
      );

      await loginRepo.save(registro);

      const segundosRestantes = Math.ceil(
        (new Date(registro.bloqueoHasta).getTime() - Date.now()) / 1000
      );

      await log(req, {
        level: "WARN",
        user: email || "anon",
        message: `LOGIN_BLOCKED ip=${clientIp} email=${email} remaining=${segundosRestantes}s intentosDuranteBloqueo=${registro.intentosBloqueado}`,
      });

      return res.status(429).json({
        ok: false,
        error: {
          message: `Demasiados intentos. Bloqueado por ${segundosRestantes} segundos.`,
        },
      });
    }

    const usuario = await repo().findOne({
      where: { email },
      select: ["id", "role", "email", "contraseña", "nombre", "apellido"],
    });

    // 2. LÓGICA DE FALLO (Usuario no encontrado o Contraseña incorrecta)
    const manejarFallo = async (razon) => {
      registro.intentos += 1;

      let mensaje = "Credenciales inválidas";

      if (registro.intentos >= 3) {
        const minutos = envs.NODE_ENV === "production" ? 60 : 1;
        registro.bloqueoHasta = new Date(Date.now() + minutos * 60 * 1000);
        registro.intentos = 0;
        registro.intentosBloqueado = 0; // Resetear contador de intentos durante bloqueo
        mensaje = `Has fallado 3 veces. Acceso bloqueado por ${minutos} minuto(s).`;
      } else {
        mensaje = `Credenciales inválidas. Intento ${registro.intentos} de 3.`;
      }

      await loginRepo.save(registro);

      await log(req, {
        level: "INFO",
        user: email || "anon",
        message: `LOGIN_FAILED reason=${razon} endpoint=${endpoint} ip=${clientIp} email=${email} attempt=${registro.intentos}`,
      });

      return res.status(401).json({ ok: false, error: { message: mensaje } });
    };

    if (!usuario) return await manejarFallo("USER_NOT_FOUND");

    const valid = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!valid) return await manejarFallo("INVALID_PASSWORD");

    // 3. LOGIN EXITOSO: Limpiar intentos persistidos
    await loginRepo.delete({ ip: clientIp });

    const payload = { id: usuario.id, role: usuario.role };
    const token = jwt.sign(payload, envs.JWT_SECRET, {
      expiresIn: envs.JWT_EXPIRES,
    });

    const { contraseña: _p, ...safe } = usuario;

    await log(req, {
      level: "INFO",
      user: usuario.email,
      message: `LOGIN_SUCCESS endpoint=${endpoint} ip=${clientIp} userId=${usuario.id} email=${usuario.email} role=${usuario.role}`,
    });

    return res.status(200).json({
      ok: true,
      message: "Login exitoso",
      metadata: { usuario: safe, token },
    });

  } catch (error) {
    await log(req, {
      level: "INFO",
      user: email || "anon",
      message: `LOGIN_ERROR endpoint=${endpoint} ip=${clientIp} email=${email} error=${error?.message}`,
    });

    return res.status(500).json({
      ok: false,
      error: {
        message: "Error interno durante el login.",
        detail: error?.message,
      },
    });
  }
};

const findAll = async (req = request, res = response) => {
  const usuarios = await repo().find();

  await log(req, {
    level: "INFO",
    user: req.user?.email || "anon",
    message: `Listado de todos los usuarios. endpoint=${req.originalUrl || req.url} cantidad=${usuarios.length}`,
  });

  res.status(200).json({
    ok: true,
    message: "Usuarios obtenidos correctamente.",
    data: usuarios,
  });
};

export const usuarioController = { register, login, findAll };

export { register, login, findAll };
