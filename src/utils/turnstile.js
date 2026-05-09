// TP01 - Defensa DDoS para SGGM V01
// Controlador para verificar el token de CAPTCHA utilizando Cloudflare Turnstile.

import { envs } from "../configuration/envs.js";

export const verifyTurnstileToken = async ({ token, remoteIp }) => {
  if (!token) {
    return {
      success: false,
      error: "No se recibió token de CAPTCHA.",
    };
  }

  const formData = new FormData();
  formData.append("secret", envs.TURNSTILE_SECRET_KEY);
  formData.append("response", token);

  if (remoteIp) {
    formData.append("remoteip", remoteIp);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  return {
    success: data.success === true,
    data,
  };
};