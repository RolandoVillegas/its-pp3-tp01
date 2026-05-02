import { Router } from "express";
import { profesionalController } from "./profesional.controller.js";
import { validate } from "../../middlewares/validator.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import authorize from "../../middlewares/authorize.middleware.js";
import {
  createProfesionalSchema,
  updateProfesionalSchema,
} from "../profesional/schema/profesional.schema.js";

const profesionalRoutes = Router();

profesionalRoutes.get(
  "/profesionales",
  authMiddleware,
  authorize("admin", "rrhh", "administrativo", "coordinador"),
  profesionalController.findAll
);

profesionalRoutes.get(
  "/profesionales/:PRF",
  authMiddleware,
  authorize("admin", "rrhh", "administrativo", "coordinador"),
  profesionalController.findOne
);

profesionalRoutes.post(
  "/profesionales",
  authMiddleware,
  authorize("admin", "rrhh"),
  validate(createProfesionalSchema),
  profesionalController.create
);

profesionalRoutes.patch(
  "/profesionales/:PRF",
  authMiddleware,
  authorize("admin", "rrhh"),
  validate(updateProfesionalSchema),
  profesionalController.updatePartial
);

export default profesionalRoutes;
