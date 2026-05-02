import { EntitySchema } from "typeorm";

/**
 * Entidad Novedad
 * Registra las asistencias de guardia. Implementa campos de auditoría y borrado lógico.
 */

export const novedadEntity = new EntitySchema({
  name: "Novedad",
  tableName: "novedad",
  columns: {
    novedad_id: {
      type: "int",
      primary: true,
      generated: true,
    },

    id_profesional: {
      type: "varchar",
      length: 7,
      nullable: false,
      comment: "FK lógica al profesional (PRF)",
    },

    fechahora_inicio_guardia: {
      type: "datetime",
      nullable: false,
    },
    dia_inicio_guardia: {
      type: "varchar",
      length: 10, // lunes, martes, ..., domingo.
      nullable: false,
    },

    fechahora_fin_guardia: {
      type: "datetime",
      nullable: false,
    },
    dia_fin_guardia: {
      type: "varchar",
      length: 10, // lunes, martes, ..., domingo.
      nullable: false,
    },

    horas_trabajadas: {
      type: "decimal",
      precision: 5,
      scale: 2,
      nullable: false,
      default: 0,
    },

    observaciones: {
      type: "varchar",
      length: 255,
      nullable: true,
    },

    // Atributos/campos para auditoría
    fecha_alta: { type: "datetime", nullable: false },
    id_usuario_alta: { type: "int", nullable: false },

    fecha_ultima_modificacion: { type: "datetime", nullable: true },
    id_usuario_ultima_modificacion: { type: "int", nullable: true },

    // Implementación de borrado lógico
    eliminado: { type: "boolean", default: false },
    fecha_eliminacion: { type: "datetime", nullable: true },
    id_usuario_eliminacion: { type: "int", nullable: true },
  },
  indices: [
    { name: "idx_novedad_profesional", columns: ["id_profesional"] },
    { name: "idx_novedad_inicio", columns: ["fechahora_inicio_guardia"] },
  ],
});
