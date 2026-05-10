import { Router } from "express";
import { validate } from "../../middlewares/validator.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import authorize from "../../middlewares/authorize.middleware.js";
import { servicioDttController } from "./servicioDtt.controller.js";
import { createServicioDttSchema } from "./schema/servicioDtt.schema.js";

const serviciodttroute = Router();

// Protección para admin y rrhh
const protectAdminRrhh = [authMiddleware, authorize("admin", "rrhh")];
// Protección solo autenticación
const protectAuth = [authMiddleware];

serviciodttroute.post(
  "/servicios-dtt",
  ...protectAdminRrhh,
  validate(createServicioDttSchema),
  servicioDttController.create
);

serviciodttroute.put(
  "/servicios-dtt/:id",
  ...protectAdminRrhh,
  validate(createServicioDttSchema),
  servicioDttController.update
);

serviciodttroute.get("/servicios-dtt", ...protectAuth, servicioDttController.findAll);
serviciodttroute.get("/servicios-dtt/:id", ...protectAuth, servicioDttController.findOne);

export default serviciodttroute;
