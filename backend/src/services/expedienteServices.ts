import conexion from '../database/conexion.js';
import type { Expediente, ExpedienteNuevo } from './typesUsuarios.js';

export const obtieneExpedientes = async () => {
    try {
        const [results] = await conexion.query(`
            SELECT e.*, u.nombre, u.apellido_paterno, u.apellido_materno
            FROM expediente e
            INNER JOIN paciente p ON e.id_paciente = p.id_paciente
            INNER JOIN usuario u ON p.id_usuario = u.id_usuario
        `);
        return results;
    } catch(err) {
        return { error: "No se puede obtener los expedientes" }
    }
}

export const obtieneExpediente = async (id_expediente: number) => {
    try {
        const [results] = await conexion.query(`
            SELECT e.*, u.nombre, u.apellido_paterno, u.apellido_materno
            FROM expediente e
            INNER JOIN paciente p ON e.id_paciente = p.id_paciente
            INNER JOIN usuario u ON p.id_usuario = u.id_usuario
            WHERE e.id_expediente = ? LIMIT 1
        `, [id_expediente]);
        return results;
    } catch {
        return { error: "No se encuentra el expediente" }
    }
}

export const obtieneExpedientePorPaciente = async (id_paciente: number) => {
    try {
        const [results] = await conexion.query(`
            SELECT e.*, u.nombre, u.apellido_paterno, u.apellido_materno
            FROM expediente e
            INNER JOIN paciente p ON e.id_paciente = p.id_paciente
            INNER JOIN usuario u ON p.id_usuario = u.id_usuario
            WHERE e.id_paciente = ?
        `, [id_paciente]);
        return results;
    } catch {
        return { error: "No se encuentra el expediente del paciente" }
    }
}

export const registraExpediente = async (nuevo: ExpedienteNuevo) => {
    try {
        const [existe]: any = await conexion.query(
            'SELECT id_expediente FROM expediente WHERE id_paciente = ? LIMIT 1',
            [nuevo.id_paciente]
        );

        if (existe.length > 0) {
            return { error: 'El paciente ya tiene un expediente registrado' };
        }

        const [result]: any = await conexion.query(
            'INSERT INTO expediente(id_paciente, codigo, ant_patologicos, medicamentos_actuales, alergias) values(?,?,?,?,?)',
            [nuevo.id_paciente, nuevo.codigo, nuevo.ant_patologicos, nuevo.medicamentos_actuales, nuevo.alergias]
        );
        return { mensaje: 'Expediente registrado correctamente', id_expediente: result.insertId };
    } catch(err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede registrar el expediente" }
    }
}

export const editaExpediente = async (datos: Expediente) => {
    try {
        const [existe]: any = await conexion.query(
            'SELECT id_expediente FROM expediente WHERE id_expediente = ? LIMIT 1',
            [datos.id_expediente]
        );

        if (existe.length === 0) {
            return { error: 'No se encuentra el expediente' };
        }

        await conexion.query(
            `UPDATE expediente SET
                ant_patologicos = ?,
                medicamentos_actuales = ?,
                alergias = ?
            WHERE id_expediente = ?`,
            [datos.ant_patologicos, datos.medicamentos_actuales, datos.alergias, datos.id_expediente]
        );

        return { mensaje: 'Expediente actualizado correctamente' };

    } catch(err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede editar el expediente" }
    }
}

export const borrarExpediente = async (id_expediente: number) => {
    try {
        const [existe]: any = await conexion.query(
            'SELECT id_expediente FROM expediente WHERE id_expediente = ? LIMIT 1',
            [id_expediente]
        );

        if (existe.length === 0) {
            return { error: 'No se encuentra el expediente' };
        }

        await conexion.query('DELETE FROM expediente WHERE id_expediente = ?', [id_expediente]);

        return { mensaje: 'Expediente eliminado correctamente' };

    } catch(err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede borrar el expediente" }
    }
}