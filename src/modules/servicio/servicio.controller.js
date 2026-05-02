import { request, response } from "express";
import AppDatasource from "../../providers/datasource.provider.js";
import { envs } from "../../configuration/envs.js";
import { createLogger } from "../../logging/logger.js";

const log = createLogger("servicio");

const servicioRepo = () => AppDatasource.getRepository("Servicio");
const usuarioRepo = () => AppDatasource.getRepository("Usuario");

export const servicioController = {
  async create(req = request, res = response) {
    const { fecha_cierre, coordinador_usuario_id, ...otrosDatos } = req.body;

    try {
      // Si se recibió coordinador_usuario_id, validar que exista y tenga role "coordinador"
      if (coordinador_usuario_id) {
        const usuario = await usuarioRepo().findOne({ where: { id: Number(coordinador_usuario_id) } });
        if (!usuario || String(usuario.role).toLowerCase() !== "coordinador") {
          return res.status(400).json({
            ok: false,
            error: { message: "Coordinador inválido", detail: "El usuario indicado no existe o no tiene rol de coordinador." },
          });
        }
      }
      
      const nuevoServicio = await servicioRepo().save({
        ...otrosDatos,
        fecha_cierre: new Date(fecha_cierre),
        ...(coordinador_usuario_id ? { coordinador_usuario_id: Number(coordinador_usuario_id) } : {}),
      });
      
      // Recargar el servicio para obtener los campos auto-generados
      const servicioCompleto = await servicioRepo().findOne({
        where: { servicio_id: nuevoServicio.servicio_id },
      });
      
      return res.status(201).json({
        ok: true,
        message: "Servicio creado con éxito",
        data: {
          ...servicioCompleto,
          resumen: `Creado el ${servicioCompleto.created_at ? new Date(servicioCompleto.created_at).toLocaleString('es-AR') : 'N/D'} - Fecha límite: ${servicioCompleto.fecha_cierre ? new Date(servicioCompleto.fecha_cierre).toLocaleString('es-AR') : 'N/D'}`,
        },
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        error: { message: "Error al crear servicio", detail: error.message },
      });
    }
  },

  async findAll(req = request, res = response) {
    try {
      const servicios = await servicioRepo().find();
      const data = servicios.map((s) => ({
        ...s,
        resumen: `Creado el ${s.created_at ? new Date(s.created_at).toLocaleString('es-AR') : 'N/D'} - Fecha límite: ${s.fecha_cierre ? new Date(s.fecha_cierre).toLocaleString('es-AR') : 'N/D'}`,
      }));
      log(req, {message: "Servicios encontrados"});


      return res.status(200).json({
        ok: true,
        message: "Servicios encontrados",
        data,
      });
    } catch (error) {
      log(req, {message: "Error al buscar servicios"});
      return res.status(500).json({
        ok: false,
        error: { message: "Error al buscar servicios", detail: error.message },
      });
    }
  },

  async findOne(req = request, res = response) {
    const { id } = req.params;
    try {
      const servicio = await servicioRepo().findOne({
        where: { servicio_id: Number(id) },
      });
      if (!servicio) {
        return res.status(404).json({
          ok: false,
          error: { message: "Servicio no encontrado" },
        });
      }
      return res.status(200).json({
        ok: true,
        message: "Servicio encontrado",
        data: {
          ...servicio,
          resumen: `Creado el ${servicio.created_at ? new Date(servicio.created_at).toLocaleString('es-AR') : 'N/D'} - Fecha límite: ${servicio.fecha_cierre ? new Date(servicio.fecha_cierre).toLocaleString('es-AR') : 'N/D'}`,
        },
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        error: { message: "Error al buscar servicio", detail: error.message },
      });
    }
  },
  async updatePartial(req = request, res = response) {
    const { id } = req.params;
    const updates = req.body;

    try {
      const servicio = await servicioRepo().findOne({
        where: { servicio_id: Number(id) },
      });
      if (!servicio) {
        return res.status(404).json({
          ok: false,
          error: { message: "Servicio no encontrado" },
        });
      }

      // Si se intenta cambiar coordinador_usuario_id, validar que exista y tenga rol "coordinador"
      if (updates.coordinador_usuario_id !== undefined && updates.coordinador_usuario_id !== null) {
        const usuario = await usuarioRepo().findOne({ where: { id: Number(updates.coordinador_usuario_id) } });
        if (!usuario || String(usuario.role).toLowerCase() !== "coordinador") {
          return res.status(400).json({
            ok: false,
            error: { message: "Coordinador inválido", detail: "El usuario indicado no existe o no tiene rol de coordinador." },
          });
        }
      }

      servicioRepo().merge(servicio, updates);
      const updatedServicio = await servicioRepo().save(servicio);
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

  // soft delete
  async delete(req = request, res = response) {
    const { id } = req.params;

    try {
      const servicio = await servicioRepo().findOne({
        where: { servicio_id: Number(id) },
      });
      if (!servicio) {
        return res.status(404).json({
          ok: false,
          error: { message: "Servicio no encontrado" },
        });
      }
      servicio.eliminado = true;
      await servicioRepo().save(servicio);
      return res.status(200).json({
        ok: true,
        message: "Servicio eliminado",
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        error: {
          message: "Error al eliminar servicio",
          detail: error.message,
        },
      });
    }
  },

  }