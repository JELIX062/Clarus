import conexion from '../database/conexion.js';
import type { PacienteNuevo } from './typesUsuarios.js';

export const obtienePacientes = async () => {
    try {
        const [results] = await conexion.query('SELECT * FROM paciente');
        return results;
    } catch(err) {
        return { error: "No se puede obtener los pacientes" }
    }
}

export const encuentraPaciente = async (id_paciente: number) => {
    try {
        const [results] = await conexion.query('SELECT * FROM paciente WHERE id_paciente = ? LIMIT 1', [id_paciente]);
        return results;
    } catch {
        return { error: "No se encuentra el paciente" }
    }
}

export const editaPaciente = async (id_paciente: number, datos: Partial<PacienteNuevo>) => {
    try {
        const [results] = await conexion.query(
            'UPDATE paciente SET fecha_nacimiento = ?, sexo = ?, tipo_sangre = ? WHERE id_paciente = ?',
            [datos.fecha_nacimiento, datos.sexo, datos.tipo_sangre, id_paciente]
        );
        return results;
    } catch(err) {
        return { error: "No se puede editar el paciente" }
    }
}