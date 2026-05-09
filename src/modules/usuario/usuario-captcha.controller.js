// Controlador para manejar el login con CAPTCHA utilizando Cloudflare Turnstile.
// TP01 - Defensa DDoS para SGGM V01.
import { request, response } from "express";
import { login } from "./usuario.controller.js";
import { verifyTurnstileToken } from "../../utils/turnstile.js";
import { createLogger } from "../../logging/logger.js";
import { getClientIp } from "../../utils/client-ip.js";

const log = createLogger("usuario-captcha");

const loginCaptcha = async (req = request, res = response) => {
  const { captchaToken } = req.body;
  const endpoint = req.originalUrl || req.url;
  const clientIp = getClientIp(req);

  try {
    const captchaResult = await verifyTurnstileToken({
      token: captchaToken,
      remoteIp: clientIp,
    });

    if (!captchaResult.success) {
      await log(req, {
        level: "INFO",
        user: req.body?.email || "anon",
        message: `LOGIN_CAPTCHA_FAILED reason=INVALID_CAPTCHA endpoint=${endpoint} ip=${clientIp}`,
      });

      return res.status(403).json({
        ok: false,
        error: {
          message: "Verificación CAPTCHA inválida.",
        },
      });
    }

    await log(req, {
      level: "INFO",
      user: req.body?.email || "anon",
      message: `LOGIN_CAPTCHA_SUCCESS endpoint=${endpoint} ip=${clientIp}`,
    });

    return login(req, res);
  } catch (error) {
    await log(req, {
      level: "INFO",
      user: req.body?.email || "anon",
      message: `LOGIN_CAPTCHA_ERROR endpoint=${endpoint} ip=${clientIp} error=${error?.message}`,
    });

    return res.status(500).json({
      ok: false,
      error: {
        message: "Error interno durante la verificación CAPTCHA.",
        detail: error?.message,
      },
    });
  }
};

export { loginCaptcha };