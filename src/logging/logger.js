import { publishLog } from "../providers/rabbitmq.provider.js";
import { getClientIp } from "../utils/client-ip.js";            // Obtiene la IP del cliente.

// Creación un logger asociado a un módulo (ej. "profesional, servicio, etc.")
export function createLogger(moduleNameFromFile, defaults = {}) {
  // Permite override por .env si se configura variable de ambiente
  const envModule = process.env.MODULE_NAME?.trim();
  // El nombre del módulo suministrado tiene prioridad sobre el recuperado
  // desde .env o el default "app".
  const moduleName = moduleNameFromFile || envModule  || "app";

  return async function log(req, { message, level = "INFO", user }) {
    try {
      await publishLog({
        level,
        module: moduleName,
        user: user ?? req?.user?.email ?? "anon",
        clientIp: getClientIp(req),
        message: message ?? "",
        // Nota: el provider ya completa messageId/timestamp y filtra los campos no permitidos.
      });
    } catch (e) {
      // Si ocurre un error, no se rompe el flujo de la app por causa del logging y
      // se envía un mensaje a la consola.
      console.warn(`[LOG][${moduleName}] falló el registro del mensaje:`, e.message);
    }
  };
}
