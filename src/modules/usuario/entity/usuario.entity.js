import {EntitySchema} from "typeorm";

export const UsuarioEntity = new EntitySchema({
  name: 'Usuario',
  tableName: 'usuarios',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    email: { type: String, length: 50, unique: true },
    contraseña: { type: String, length: 255 },
    nombre: { type: String, length: 100, nullable: true },
    apellido: { type: String, length: 100, nullable: true },
    role: { type: String, length: 20, default: 'user' },
    Creado: { type: 'timestamp', createDate: true },
  },
  indices: [{ name: 'IDX_USERS_EMAIL', columns: ['email'], unique: true }],
});
