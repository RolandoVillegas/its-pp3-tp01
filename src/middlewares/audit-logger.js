import { createLogger } from "../logging/logger.js";

export function auditLogger(options = {}) {
  const {
    moduleName = "http",
    ignored = ["/health", "/docs", "/favicon.ico"],
    sample = 1, // 1 = 100%; 0.1 = 10%; etc.
    methods = ["GET", "POST", "PUT", "PATCH", "DELETE"],
  } = options;

  const log = createLogger(moduleName);

  return function audit(req, res, next) {
    if (!methods.includes(req.method)) return next();
    if (ignored.some((p) => req.path.startsWith(p))) return next();
    if (Math.random() > sample) return next();

    const start = Date.now();
    res.on("finish", () => {
      const ms = Date.now() - start;
      
      const info = {
        method: req.method,
        path: req.originalUrl || req.url,
        status: res.statusCode,
        durMs: ms,
      };
      const user = req.user?.email ?? "anon";

      log(req, {
        message: `REQ ${info.method} ${info.path} -> ${info.status} (${info.durMs}ms) user=${user}`,
      });
    });

    next();
  };
}
