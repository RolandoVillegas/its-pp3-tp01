import app from "./app.js";
import AppDataSource from "./providers/datasource.provider.js";
import { envs } from "./configuration/envs.js";
// Logging de eventos.
import { rabbitConnect } from "./providers/rabbitmq.provider.js";

const main = async () => {
  try {
    console.info("Inicializando conexión a base de datos...");
    await AppDataSource.initialize();
    console.info("Base de datos conectada");

    // Inicialización de RabbitMQ sin bloquear el arranque de la API
    rabbitConnect()
      .then(() => console.info("[RabbitMQ] conexión establecida"))
      .catch((err) => console.warn("[RabbitMQ] no conectó:", err.message));

    // Despliegue en VPS: '0.0.0.0' agregado para permitir que escuche todas las 
    // interfases del servidor Linux.
    app.listen(envs.PORT, '0.0.0.0' ,() => {
      console.info(`Servidor escuchando en ${envs.DB_HOST}:${envs.PORT}`);
    });
  } catch (err) {
    console.error("Error al iniciar la aplicación:", err);
    process.exit(1);
  }
};

main();
