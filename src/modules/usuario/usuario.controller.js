import { request, response } from "express";
import * as bcrypt from "bcrypt";
import AppDatasource from "../../providers/datasource.provider.js";
import { envs } from "../../configuration/envs.js";
import jwt from "jsonwebtoken";
import { createLogger } from "../../logging/logger.js";
import { getClientIp } from "../../utils/client-ip.js";

const repo = () => AppDatasource.getRepository("Usuario");

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
    const usuario = await repo().findOne({
      where: { email },
      select: ["id", "role", "email", "contraseña", "nombre", "apellido"],
    });

    if (!usuario) {
      await log(req, {
        level: "INFO",
        user: email || "anon",
        message: `LOGIN_FAILED reason=USER_NOT_FOUND endpoint=${endpoint} ip=${clientIp} email=${email}`,
      });

      return res
        .status(401)
        .json({ ok: false, error: { message: "Credenciales inválidas" } });
    }

    const valid = await bcrypt.compare(contraseña, usuario.contraseña);

    if (!valid) {
      await log(req, {
        level: "INFO",
        user: usuario.email,
        message: `LOGIN_FAILED reason=INVALID_PASSWORD endpoint=${endpoint} ip=${clientIp} userId=${usuario.id} email=${usuario.email}`,
      });

      return res
        .status(401)
        .json({ ok: false, error: { message: "Credenciales inválidas" } });
    }

    // payload mínimo (id + role)
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
      message: "Login",
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
