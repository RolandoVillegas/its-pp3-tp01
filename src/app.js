import express from "express";
import { envs } from "./configuration/envs.js";
import passport from "passport";      
import profesionalRoutes from "./modules/profesional/profesional.route.js";
import novedadRoutes from "./modules/novedad/novedad.route.js";
import usuarioRoutes from "./modules/usuario/usuario.route.js";
import servicioRoutes from "./modules/servicio/servicio.route.js";
import serviciodttroute from "./modules/ServicoDtt/servicioDtt.route.js";
import { auditLogger } from "./middlewares/audit-logger.js";

const app = express();

app.set("trust proxy", true);  // Esto sirve para IPs reales tras proxy

// Auditoría global 
app.use(auditLogger({
  moduleName: "http",
  sample: 1,
  ignored: ["/health", "/docs", "/favicon.ico", "/static"],
}));


app.use(express.json());
app.set("port", envs.PORT);

app.use(passport.initialize());          

app.use("/api", profesionalRoutes);
app.use("/api", novedadRoutes);
app.use("/api", usuarioRoutes);
app.use("/api", servicioRoutes);
app.use("/api", serviciodttroute);


// Endpoint para verificar si la aplicación está funcionado: /health
app.get("/health", (req, res) => {
  res.json({ 
    ok: true, 
    message: "Servidor funcionando." });
});

export default app;
