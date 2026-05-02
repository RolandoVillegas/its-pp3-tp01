import { request, response } from "express";
import AppDataSource from "../../providers/datasource.provider.js";
import { createLogger } from "../../logging/logger.js";

const log = createLogger("profesional");
const profesionalRepo = () => AppDataSource.getRepository("Profesional");

export const profesionalController = {
  async findAll(req = request, res = response) {
    const profesionales = await profesionalRepo().find({
      order: { PRF: "ASC" },
    });

    
    log(req, {
      message: "Listado de todos los profesionales.",
    });

    return res.status(200).json({
      ok: true,
      data: profesionales,
    });
  },

  async findOne(req = request, res = response) {
    const { PRF } = req.params;
    const profesional = await profesionalRepo().findOne({
      where: { PRF },
    });
    if (!profesional) {
      
      log(req, {
        message: `Listado de un profesional - Profesional ${PRF} no encontrado `,
      });

      return res.status(404).json({
        ok: false,
        error: { message: "Profesional no encontrado." },
      });
    }

    log(req, {
      message: `Listado de un profesional - Profesional ${PRF} encontrado `,
    });

    return res.status(200).json({
      ok: true,
      data: profesional,
    });
  },

  async create(req = request, res = response) {
    const nuevoProfesional = await profesionalRepo().save(req.body);
    return res.status(201).json({
      ok: true,
      message: "Profesional creado.",
      data: nuevoProfesional,
    });
  },

  async updatePartial(req = request, res = response) {
    const { PRF } = req.params;
    await profesionalRepo().update({ PRF }, req.body);
    const actualizadoProfesional = await profesionalRepo().findOne({
      where: { PRF },
    });
    if (!actualizadoProfesional)
      return res.status(404).json({
        ok: false,
        error: { message: "Profesional no encontrado." },
      });
    return res.status(200).json({
      ok: true,
      message: "Profesional actualizado",
      data: actualizadoProfesional,
    });
  },

  /**
   * Nota: no hay procedimiento de eliminación porque esta tabla simula ser
   * una tabla maestra del Sistema Datatech y el proceso de eliminación se
   * maneja desde el propio sistema ERP.
   **/
};
