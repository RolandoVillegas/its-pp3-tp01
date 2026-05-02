import "reflect-metadata";
import { DataSource } from "typeorm";
import { envs } from "../configuration/envs.js";
import { profesionalEntity } from "../modules/profesional/entity/profesional.entity.js";
import { UsuarioEntity } from "../modules/usuario/entity/usuario.entity.js";
import { novedadEntity } from "../modules/novedad/entity/novedad.entity.js";
import { servicioEntity } from "../modules/servicio/entity/servicio.entity.js";
import { servicioDttEntity } from "../modules/ServicoDtt/entity/servicioDtt.entity.js";

const AppDataSource = new DataSource({
  type: "mysql",
  host: envs.DB_HOST,
  port: envs.DB_PORT,
  username: envs.DB_USER,
  password: envs.DB_PASSWORD,
  database: envs.DATABASE,
  entities: [
    profesionalEntity, UsuarioEntity, novedadEntity, servicioEntity, servicioDttEntity
  ],
  synchronize: true,  // Colocar en false cuando pase a PRODUCCIÓN.
  logging: envs.NODE_ENV === "development",
});

export default AppDataSource;
