import { Router } from "express";
import { validate } from "../../middlewares/validator.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import authorize from "../../middlewares/authorize.middleware.js";
import { servicioController } from "./servicio.controller.js";
import { createServicioSchema } from "./schema/servicio.eschema.js";

const servicioRoutes = Router();

// Protección para coordinador y admin
const protect = [authMiddleware, authorize("coordinador", "admin", "rrhh")];
// Protección solo para coordinador

servicioRoutes.get("/servicios", ...protect, servicioController.findAll);
servicioRoutes.get("/servicios/:id", ...protect, servicioController.findOne);

servicioRoutes.post(
  "/servicios",
  ...protect,
  validate(createServicioSchema),
  servicioController.create
);

servicioRoutes.patch(
  "/servicios/:id",
  ...protect,
  servicioController.updatePartial
);

servicioRoutes.delete("/servicios/:id", ...protect, servicioController.delete);

export default servicioRoutes;
