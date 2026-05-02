import { EntitySchema } from "typeorm";

export const servicioDttEntity = new EntitySchema({
    name: 'ServicioDtt',
    tableName: 'serviciosdtt',
    columns: {
        SER: {type: 'varchar', length: 50, primary: true},
        DES: {type: 'varchar', length: 255, nullable: false},
        ACT: {type: 'varchar', length: 100, nullable: false},
    },

    indices: [
        { name: 'IDX_SERVICIOSDTT_SER', columns: ['SER'] },
        { name: 'IDX_SERVICIOSDTT_DES', columns: ['DES'] },
    ],

});