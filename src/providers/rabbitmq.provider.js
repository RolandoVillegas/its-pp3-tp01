import amqplib from "amqplib";
import dotenv from "dotenv";
import { randomUUID } from "node:crypto"; 
dotenv.config();

const {
  AMQP_USER,
  AMQP_PASS,
  AMQP_HOST,
  AMQP_PORT = "5672",
  AMQP_VHOST = "/",
  AMQP_EXCHANGE,
  AMQP_EXCHANGE_TYPE = "topic",
  AMQP_ROUTING_KEY = "logs.info",
  APP_NAME = "sggm", // Solo para configurar un default del module, si no se suministra uno.
} = process.env;

let conn, ch;

function normalizeVhost(vh) {
  if (!vh) return "/";
  return vh.startsWith("/") ? vh : `/${vh}`;
}

// Normaliza IP a IPv4 simple (evita "::1")
function normalizeIp(ip) {
  if (!ip) return "127.0.0.1";
  // Si viene "::1" o algo con ":", se devuelve loopback ipv4
  if (ip.includes(":")) return "127.0.0.1";
  // Si viene lista separada por comas (x-forwarded-for), toma la primera IP
  if (ip.includes(",")) return ip.split(",")[0].trim();
  return ip.trim();
}

export async function rabbitConnect() {
  const vhost = normalizeVhost(AMQP_VHOST);
  const url = `amqp://${AMQP_USER}:${AMQP_PASS}@${AMQP_HOST}:${AMQP_PORT}${vhost}`;
  conn = await amqplib.connect(url, { heartbeat: 15 });
  ch = await conn.createChannel();
  await ch.assertExchange(AMQP_EXCHANGE, AMQP_EXCHANGE_TYPE, { durable: true });
  return ch;
}

export async function publishLog(payload, routingKey = AMQP_ROUTING_KEY) {
  if (!ch) await rabbitConnect();

  // Solo los campos permitidos por el schema del consumer
  const msg = {
    messageId: payload.messageId ?? randomUUID(),                       // UUID v4
    timestamp: payload.timestamp ?? new Date().toISOString(),           // ISO UTC
    level: payload.level ?? "INFO",                                     // El consumer acepta "INFO"
    module: payload.module ?? APP_NAME,                                 // Ej. "profesional"
    user: payload.user ?? "anon",                                       // string requerido
    clientIp: normalizeIp(payload.clientIp),                            // IPv4
    message: payload.message ?? "",                                     // Detalle del mensaje
  };

  ch.publish(AMQP_EXCHANGE, routingKey, Buffer.from(JSON.stringify(msg)), {
    persistent: true,
  });
}

// Cierre limpio
process.on("SIGINT", async () => {
  try {
    await ch?.close();
    await conn?.close();
  } catch {}
  process.exit(0);
});
