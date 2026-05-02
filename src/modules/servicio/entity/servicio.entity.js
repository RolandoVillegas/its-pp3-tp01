import {EntitySchema} from "typeorm";

export const servicioEntity = new EntitySchema({
  name: 'Servicio',
  tableName: 'servicios',
    columns: {
    servicio_id: { type: 'int', primary: true, generated: true },
    nombre: { type: 'varchar', length: 100, nullable: false },
    ubicacion: {type: 'varchar', length: 255, nullable: false },
    servicio_cod_datatech: { type: 'varchar', length: 50, nullable: true },
    coordinador_usuario_id: { type: 'int', nullable: true},
    fecha_cierre: { type: 'datetime', nullable: true },
    created_at: { type: 'timestamp', createDate: true },
    eliminado: { type: 'boolean', default: false },
    },
    indices: [
      { name: 'IDX_SERVICIOS_NOMBRE', columns: ['nombre'] },
      { name: 'IDX_SERVICIOS_UBICACION', columns: ['ubicacion'] },
      {name: 'IDX_SERVICIO_CORDINADOR', columns: ['coordinador_usuario_id']}
    ],
});