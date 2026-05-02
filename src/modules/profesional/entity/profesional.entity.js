import { EntitySchema } from "typeorm";

/**
 * Entidad Profesional
 * Simula la tabla maestra SRN.dbo.CLIPRF del sistema Datatech.
 */

export const profesionalEntity = new EntitySchema({
  name: "Profesional",
  tableName: "profesional",
  columns: {
    PRF: {
      type: "varchar",
      length: 7,
      primary: true,
      nullable: false,
      comment: "Código de profesional (clave primaria)",
    },
    NOM: {
      type: "varchar",
      length: 40,
      nullable: false,
      comment: "Nombre del profesional",
    },
    ACT: {
      type: "char",
      length: 1,
      nullable: false,
      comment: "S=activo, N=inactivo/no utilizable",
    },
  },
});