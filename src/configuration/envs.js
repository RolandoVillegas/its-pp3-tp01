// Importación de recursos
import joi from "joi"; // Biblioteca Joi para validación de variables de ambiente (esquema de datos).
import dotenv from "dotenv"; // Biblioteca Dotenv para cargar variables desde un archivo.

// Recuperación de las variables de entorno, utilizando dotenv. Quedan a disposición en process.env.
dotenv.config();

// Creación del esquema joi, que luego se utilizará en la validación.
const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    DB_USER: joi.string().required(),
    DB_PASSWORD: joi.string().allow("").required(), //.allow('') permite tener una password vacía, como pasa en XAMPP
    DATABASE: joi.string().required(),
    DB_PORT: joi.number().required(),
    DB_HOST: joi.string().required(),
    JWT_SECRET: joi.string().min(10).required(),
    JWT_EXPIRES: joi.string().required(),
    // Fecha límite para la creación de servicios (ISO 8601). Ej: 2025-12-31T23:59:59.999Z
    NODE_ENV: joi
      .string()
      .valid("development", "production", "test")
      .required(),
  })
  .unknown(true); 

// Desestructuración del objeto y validación.
const { value: envVars, error } = envsSchema.validate(process.env, {
  abortEarly: false,
});

// Si existe un error, se ordena informa antes de levantar el servidor.
if (error) throw new Error(`Error de validación de variables de entorno: ${error.message} `);

// Por último, se exportan las variables para que sean visibles en todo el proyecto.
export const envs = {
  PORT: envVars.PORT,
  DB_USER: envVars.DB_USER,
  DB_PASSWORD: envVars.DB_PASSWORD,
  DATABASE: envVars.DATABASE,
  DB_PORT: envVars.DB_PORT,
  DB_HOST: envVars.DB_HOST,
  JWT_SECRET: envVars.JWT_SECRET,
  JWT_EXPIRES: envVars.JWT_EXPIRES,
  NODE_ENV: envVars.NODE_ENV,
};
