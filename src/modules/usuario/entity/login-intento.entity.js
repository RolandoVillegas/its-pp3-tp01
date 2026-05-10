import { EntitySchema } from "typeorm";

export const loginIntentoEntity = new EntitySchema({
  name: "LoginIntento",
  tableName: "login_intentos",
  columns: {
    ip: { type: "varchar", length: 45, primary: true },
    intentos: { type: "int", default: 0 },
    intentosBloqueado: { type: "int", default: 0 },
    bloqueoHasta: { type: "datetime", nullable: true },
    updated_at: { type: "timestamp", updateDate: true },
  },
  indices: [{ name: "IDX_LOGIN_INTENTOS_IP", columns: ["ip"], unique: true }],
});
