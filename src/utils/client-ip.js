export function getClientIp(req) {
  // 1) X-Forwarded-For (puede traer lista: "ip1, ip2, ip3")
  const xff = (req.headers["x-forwarded-for"] || "").toString();
  if (xff) {
    const first = xff.split(",")[0].trim();
    return normalizeIp(first);
  }

  // 2) X-Real-IP (algunos proxies)
  const xri = (req.headers["x-real-ip"] || "").toString();
  if (xri) return normalizeIp(xri);

  // 3) req.ip (Express) o remoteAddress (Node)
  const ip =
    req.ip ||
    req?.socket?.remoteAddress ||
    req?.connection?.remoteAddress ||
    "127.0.0.1";

  return normalizeIp(ip);
}

// Limpieza de puertos y normalización a IPv4 “amigable” si es ::1 o IPv6 mapeada.
function normalizeIp(raw) {
  if (!raw) return "127.0.0.1";
  let ip = raw.trim();

  // Si viene con puerto "1.2.3.4:5678"
  const colonCount = (ip.match(/:/g) || []).length;
  const hasPortV4 = colonCount === 1 && ip.includes(".");
  if (hasPortV4) ip = ip.split(":")[0];

  // IPv6 loopback o mapeada -> 127.0.0.1
  if (ip === "::1" || ip.startsWith("::ffff:")) return "127.0.0.1";

  // Si es lista accidental, toma la primera.
  if (ip.includes(",")) ip = ip.split(",")[0].trim();

  return ip;
}
