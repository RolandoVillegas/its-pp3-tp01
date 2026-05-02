import { request, response } from "express";
import AppDatasource from "../../providers/datasource.provider.js";
import { envs } from "../../configuration/envs.js";
import { createLogger } from "../../logging/logger.js";

const log = createLogger("ServicioDttController");

const servicioDttRepo = () => AppDatasource.getRepository("ServicioDtt");

export const servicioDttController = {
  async create(req = request, res = response) {
    const { SER, DES, ACT } = req.body;
    try {
      const nuevoServicio = await servicioDttRepo().save({
        SER,
        DES,
        ACT,
      });
      await log(req, { message: "ServicioDTT Creado con éxito", level: "INFO" });
      return res.status(201).json({ ok: true, data: nuevoServicio });
    } catch (error) {
      return res
        .status(500)
        .json({ ok: false, error: "Error al crear servicio", detail: error.message });
    }
  },

  async update(req = request, res = response) {
    const { SER } = req.params;
    try {
      const servicioDtt = await servicioDttRepo().findOne({
        where: { SER },
      });
      if (!servicioDtt) {
        return res.status(404).json({
          ok: false,
          error: {
            message: "Servicio no encontrado",
            detail: `No se encontró un servicio con el id ${SER}`,
          },
        });
      }
      const updates = req.body;
      servicioDttRepo().merge(servicioDtt, updates);
      const updatedServicio = await servicioDttRepo().save(servicioDtt);
      await log(req, { message: "ServicioDTT Actualizado con éxito", level: "INFO" });
      return res.status(200).json({
        ok: true,
        message: "Servicio actualizado",
        data: updatedServicio,
      });
    } catch (error) {
      
      return res.status(500).json({
        ok: false,
        error: {
          message: "Error al actualizar servicio",
          detail: error.message,
        },
      });
    }
  },
  async findAll(req = request, res = response) {
    try {
      const servicios = await servicioDttRepo().find();
      await log(req, { message: "ServiciosDTT obtenidos con éxito", level: "INFO" });
      return res.status(200).json({ ok: true, data: servicios });
    } catch (error) {
      return res
        .status(500)
        .json({ ok: false, error: "Error al obtener servicios" });
    }
  },
  async findOne(req = request, res = response) {
    const { SER } = req.params;
    try {
      const servicio = await servicioDttRepo().findOne({
        where: { SER },
      });
      if (!servicio) {
        return res.status(404).json({
          ok: false,
          error: {
            message: "Servicio no encontrado",
            detail: `No se encontró un servicio con el id ${SER}`,
          },
        });
      }
      await log(req, { message: "ServicioDTT obtenido con éxito", level: "INFO" });
      return res.status(200).json({
        ok: true,
        data: servicio,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        error: {
          message: "Error al obtener servicio",
          detail: error.message,
        },
      });
    }
  },
};
