// src/modules/novedad/novedad.route.js
import { Router } from "express";
import { novedadController } from "./novedad.controller.js";
import { validate } from "../../middlewares/validator.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import authorize from "../../middlewares/authorize.middleware.js";
import {
  createNovedadSchema,
  updateNovedadSchema,
} from "../novedad/schema/novedad.schema.js";

const novedadRoutes = Router();

// Todas requieren usuario autenticado con rol válido
const protect = [authMiddleware, authorize("admin", "rrhh", "coordinador")];

// "admin", "rrhh", "administrativo", "coordinador"

novedadRoutes.get(
  "/novedades",
  ...protect,
  authMiddleware,
  authorize("admin", "rrhh", "administrativo", "coordinador"),
  novedadController.findAll
);
novedadRoutes.get(
  "/novedades/:id",
  ...protect,
  authMiddleware,
  authorize("admin", "rrhh", "administrativo", "coordinador"),
  novedadController.findOne
);

novedadRoutes.post(
  "/novedades",
  ...protect,
  authMiddleware,
  authorize("admin", "rrhh", "coordinador"),
  validate(createNovedadSchema),
  novedadController.create
);

novedadRoutes.patch(
  "/novedades/:id",
  ...protect,
  authMiddleware,
  authorize("admin", "rrhh", "coordinador"),
  validate(updateNovedadSchema),
  novedadController.updatePartial
);

novedadRoutes.delete(
  "/novedades/:id",
  authMiddleware,
  authorize("admin", "rrhh", "coordinador"),
  ...protect,
  novedadController.softDelete
);

export default novedadRoutes;
