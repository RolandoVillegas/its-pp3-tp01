import express from "express";
import { envs } from "./configuration/envs.js";
import passport from "passport";      
import profesionalRoutes from "./modules/profesional/profesional.route.js";
import novedadRoutes from "./modules/novedad/novedad.route.js";
import usuarioRoutes from "./modules/usuario/usuario.route.js";
import servicioRoutes from "./modules/servicio/servicio.route.js";
import serviciodttroute from "./modules/ServicoDtt/servicioDtt.route.js";
import { auditLogger } from "./middlewares/audit-logger.js";
import rateLimit from "express-rate-limit";

const app = express();

const GeneralLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto de bloqueo
  max: 100, // Máximo 100 intentos por IP cada minuto
  message: {
    status: 429,
    message: 'Demasiados intentos de peticiones. Bloqueado por 1 minuto.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.set("trust proxy", true);  // Esto sirve para IPs reales tras proxy

// Auditoría global 
app.use(auditLogger({
  moduleName: "http",
  sample: 1,
  ignored: ["/health", "/docs", "/favicon.ico", "/static"],
}));


app.use(express.json());
// TP01 - Defensa DDoS para SGGM V01
// Servir archivos estáticos desde la carpeta "public"
// para alojar el formulario de login con CAPTCHA.
app.use(express.static("public"));
app.set("port", envs.PORT);

app.use(passport.initialize());          

app.use("/api", GeneralLimiter, profesionalRoutes);
app.use("/api", GeneralLimiter, novedadRoutes);
app.use("/api", GeneralLimiter, usuarioRoutes);
app.use("/api", GeneralLimiter, servicioRoutes);
app.use("/api", GeneralLimiter, serviciodttroute);


// Endpoint para verificar si la aplicación está funcionado: /health
app.get("/health", (req, res) => {
  res.json({ 
    ok: true, 
    message: "Servidor funcionando." });
});

export default app;
