import { Router } from 'express';
import { validate } from '../../middlewares/validator.middleware.js';
import { createUsuarioSchema } from './schema/usuario.schema.js';
import { loginUsuario } from './schema/login.schema.js';
import { register, login, findAll } from './usuario.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';


const usuarioRoutes = Router();

// Protección solo autenticación
const protect = [authMiddleware];

usuarioRoutes.post("/register", validate(createUsuarioSchema), register);
usuarioRoutes.post("/login", validate(loginUsuario), login);
usuarioRoutes.get("/users", ...protect, findAll);

export default usuarioRoutes;
