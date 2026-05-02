import { request, response } from "express";
import AppDataSource from "../../providers/datasource.provider.js";

const novedadRepo = () => AppDataSource.getRepository("Novedad");
const profesionalRepo = () => AppDataSource.getRepository("Profesional");
const servicioRepo = () => AppDataSource.getRepository("Servicio");

// Funciones adicionales para cálculo de campos.
function diaSemanaES(date) {
  // 0=Domingo ... 6=Sábado
  const dias = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  return dias[new Date(date).getDay()];
}

function diffHoras(inicio, fin) {
  const ms = new Date(fin) - new Date(inicio);
  const horas = ms / (1000 * 60 * 60);
  return Number(horas.toFixed(2));
}
// Fin de funciones adicionales.


export const novedadController = {
  async findAll(req = request, res = response) {
    const data = await novedadRepo().find({
      where: { eliminado: false },
      order: { fechahora_inicio_guardia: "DESC" },
    });
    return res.status(200).json({ ok: true, data });
  },

  async findOne(req = request, res = response) {
    const { id } = req.params;
    const item = await novedadRepo().findOne({ where: { novedad_id: Number(id) } });
    if (!item || item.eliminado) {
      return res.status(404).json({ ok: false, error: { message: "Novedad no encontrada." } });
    }
    return res.status(200).json({ ok: true, data: item });
  },

  async create(req = request, res = response) {
    const {
      id_profesional,
      fechahora_inicio_guardia,
      fechahora_fin_guardia,
      observaciones = null,
      servicio_id,
    } = req.body;

    try {
      // Validar que el servicio existe
      const servicio = await servicioRepo().findOne({
        where: { servicio_id: Number(servicio_id) },
      });

      if (!servicio) {
        return res.status(404).json({
          ok: false,
          error: {
            message: "Servicio no encontrado",
            detail: `No existe un servicio con el id ${servicio_id}`
          },
        });
      }

      // Validar que la fecha límite no haya pasado
      const fechaLimite = new Date(servicio.fecha_cierre);
      const ahora = new Date();
      const fechaagregada = new Date(fechahora_inicio_guardia)

      if (fechaagregada < fechaLimite) {
        return res.status(400).json({
          ok: false,
          error: {
            message: "No se puede agregar la novedad",
            detail: `La fecha límite del servicio (${fechaLimite.toLocaleString('es-AR')}) ya ha pasado`
          },
        });
      }

      // Validar que el profesional exista
      const prof = await profesionalRepo().findOne({ where: { PRF: id_profesional } });
      if (!prof) {
        return res.status(400).json({ ok: false, error: { message: "Profesional inexistente (PRF)." } });
      }

    const dia_inicio_guardia = diaSemanaES(fechahora_inicio_guardia);
    const dia_fin_guardia = diaSemanaES(fechahora_fin_guardia);
    const horas_trabajadas = diffHoras(fechahora_inicio_guardia, fechahora_fin_guardia);

   
    const usuarioId = Number(req.user?.usuario_id ?? req.user?.id ?? 0);

      const nuevo = await novedadRepo().save({
        id_profesional,
        fechahora_inicio_guardia,
        dia_inicio_guardia,
        fechahora_fin_guardia,
        dia_fin_guardia,
        horas_trabajadas,
        observaciones: observaciones || null,
        servicio_id: Number(servicio_id),
        fecha_alta: ahora,
        id_usuario_alta: usuarioId,
        eliminado: false,
      });

      return res.status(201).json({
        ok: true,
        message: "Novedad creada con éxito",
        data: nuevo,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        error: { message: "Error al crear novedad", detail: error.message },
      });
    }
  },

  async updatePartial(req = request, res = response) {
    const { id } = req.params;
    const existing = await novedadRepo().findOne({ where: { novedad_id: Number(id) } });
    if (!existing || existing.eliminado) {
      return res.status(404).json({ ok: false, error: { message: "Novedad no encontrada." } });
    }

    const patch = { ...req.body };

    // Si se cambia el profesional, verificar que exista.
    if (patch.id_profesional) {
      const prof = await profesionalRepo().findOne({ where: { PRF: patch.id_profesional } });
      if (!prof) {
        return res.status(400).json({ ok: false, error: { message: "Profesional inexistente (PRF)." } });
      }
    }

    // VALIDACIÓN ADICIONAL: si se modificó la fecha de inicio o el servicio, comprobar fecha_cierre
    let servicioEntity = null;
    if (patch.fechahora_inicio_guardia || patch.servicio_id) {
      const servicioIdAUsar = patch.servicio_id ? Number(patch.servicio_id) : Number(existing.servicio_id ?? existing.servicio?.servicio_id);
      const servicio = await servicioRepo().findOne({ where: { servicio_id: servicioIdAUsar } });
      if (!servicio) {
        return res.status(404).json({
          ok: false,
          error: { message: "Servicio no encontrado para la novedad." },
        });
      }

      const fechaLimite = new Date(servicio.fecha_cierre);
      const ahora = new Date();
      const fechaagregada = new Date(patch.fechahora_inicio_guardia ?? existing.fechahora_inicio_guardia);

      // la validación original rechazaba cuando la fecha agregada era anterior a la fecha límite
      if (fechaagregada < fechaLimite) {
        return res.status(400).json({
          ok: false,
          error: {
            message: "No se puede actualizar la novedad",
            detail: `La fecha límite del servicio (${fechaLimite.toLocaleString('es-AR')}) ya ha pasado`
          },
        });
      }

      if (patch.servicio_id) servicioEntity = servicio;
    }
    // FIN VALIDACIÓN

    // Si se cambian fechas, recalcular los campos derivados
    const inicio = patch.fechahora_inicio_guardia ?? existing.fechahora_inicio_guardia;
    const fin = patch.fechahora_fin_guardia ?? existing.fechahora_fin_guardia;

    if (patch.fechahora_inicio_guardia || patch.fechahora_fin_guardia) {
      patch.dia_inicio_guardia = diaSemanaES(inicio);
      patch.dia_fin_guardia = diaSemanaES(fin);
      patch.horas_trabajadas = diffHoras(inicio, fin);
    }

    patch.fecha_ultima_modificacion = new Date();
    patch.id_usuario_ultima_modificacion = Number(req.user?.usuario_id ?? req.user?.id ?? 0);

    // Aplicar cambios al entity cargado y guardar (evita UpdateQueryBuilder con propiedades no mapeadas)
    // No pasar propiedad servicio_id directamente a merge; si hay servicioEntity, asignarla.
    const { servicio_id: _sid, ...rest } = patch;
    novedadRepo().merge(existing, rest);
    if (servicioEntity) {
      // asignar la relación al entity (asume que la entidad Novedad tiene la relación 'servicio')
      existing.servicio = servicioEntity;
    }

    await novedadRepo().save(existing);

    const actualizado = await novedadRepo().findOne({ where: { novedad_id: Number(id) } });
    return res.status(200).json({ ok: true, message: "Novedad actualizada.", data: actualizado });
  },

  async softDelete(req = request, res = response) {
    const { id } = req.params;
    const existing = await novedadRepo().findOne({ where: { novedad_id: Number(id) } });
    if (!existing || existing.eliminado) {
      return res.status(404).json({ ok: false, error: { message: "Novedad no encontrada." } });
    }

    await novedadRepo().update(
      { novedad_id: Number(id) },
      {
        eliminado: true,
        fecha_eliminacion: new Date(),
        id_usuario_eliminacion: Number(req.user?.usuario_id ?? req.user?.id ?? 0),
      }
    );

    return res.status(200).json({ ok: true, message: "Novedad eliminada." });
  },
};
