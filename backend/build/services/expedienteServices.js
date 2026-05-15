import conexion from '../database/conexion.js';
import { expedienteSchema, editarExpedienteSchema } from '../schemas/usuarioSchema.js';
export const obtieneExpedientes = async () => {
    try {
        const [results] = await conexion.query(`
            SELECT e.*, u.nombre, u.apellido_paterno, u.apellido_materno
            FROM expediente e
            INNER JOIN paciente p ON e.id_paciente = p.id_paciente
            INNER JOIN usuario u ON p.id_usuario = u.id_usuario
        `);
        return results;
    }
    catch (err) {
        return { error: "No se puede obtener los expedientes" };
    }
};
export const obtieneExpediente = async (id_expediente) => {
    try {
        const [results] = await conexion.query(`
            SELECT e.*, u.nombre, u.apellido_paterno, u.apellido_materno
            FROM expediente e
            INNER JOIN paciente p ON e.id_paciente = p.id_paciente
            INNER JOIN usuario u ON p.id_usuario = u.id_usuario
            WHERE e.id_expediente = ? LIMIT 1
        `, [id_expediente]);
        return results;
    }
    catch {
        return { error: "No se encuentra el expediente" };
    }
};
export const obtieneExpedientePorPaciente = async (id_paciente) => {
    try {
        const [results] = await conexion.query(`
            SELECT e.*, u.nombre, u.apellido_paterno, u.apellido_materno
            FROM expediente e
            INNER JOIN paciente p ON e.id_paciente = p.id_paciente
            INNER JOIN usuario u ON p.id_usuario = u.id_usuario
            WHERE e.id_paciente = ?
        `, [id_paciente]);
        return results;
    }
    catch {
        return { error: "No se encuentra el expediente del paciente" };
    }
};
export const obtieneExpedientesPorDoctor = async (id_doctor) => {
    try {
        const [results] = await conexion.query(`
            SELECT e.*,
                u.nombre as nombre_paciente,
                u.apellido_paterno,
                u.apellido_materno,
                p.tipo_sangre,
                p.sexo,
                p.fecha_nacimiento
            FROM expediente e
            INNER JOIN paciente p ON e.id_paciente = p.id_paciente
            INNER JOIN usuario u ON p.id_usuario = u.id_usuario
            WHERE e.id_doctor = ?
            ORDER BY e.fecha_apertura DESC
        `, [id_doctor]);
        return results;
    }
    catch (err) {
        return { error: 'No se pueden obtener los expedientes' };
    }
};
export const registraExpediente = async (nuevo) => {
    try {
        const validacion = expedienteSchema.safeParse(nuevo);
        if (!validacion.success) {
            return { error: validacion.error };
        }
        const [existe] = await conexion.query('SELECT id_expediente FROM expediente WHERE id_paciente = ? AND id_doctor = ? LIMIT 1', // ← línea nueva
        [nuevo.id_paciente, nuevo.id_doctor]);
        if (existe.length > 0) {
            return { error: 'El paciente ya tiene un expediente registrado' };
        }
        const [result] = await await conexion.query('INSERT INTO expediente(id_paciente, id_doctor, ant_patologicos, medicamentos_actuales, alergias) values(?,?,?,?,?)', [nuevo.id_paciente, nuevo.id_doctor, nuevo.ant_patologicos ?? null, nuevo.medicamentos_actuales ?? null, nuevo.alergias ?? null]);
        const id_expediente = result.insertId;
        // Actualiza consultas físicas del paciente que no tienen expediente
        await conexion.query(`UPDATE consultafisica cf
            INNER JOIN cita c ON cf.id_cita = c.id_cita
            SET cf.id_expediente = ?
            WHERE c.id_paciente = ? AND cf.id_expediente IS NULL`, [id_expediente, nuevo.id_paciente]);
        return { mensaje: 'Expediente registrado correctamente', id_expediente: result.insertId };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede registrar el expediente" };
    }
};
export const editaExpediente = async (datos) => {
    try {
        const validacion = editarExpedienteSchema.safeParse(datos);
        if (!validacion.success) {
            return { error: validacion.error };
        }
        const [existe] = await conexion.query('SELECT id_expediente FROM expediente WHERE id_expediente = ? LIMIT 1', [datos.id_expediente]);
        if (existe.length === 0) {
            return { error: 'No se encuentra el expediente' };
        }
        await conexion.query('UPDATE expediente SET ant_patologicos=?, medicamentos_actuales=?, alergias=? WHERE id_expediente=?', [datos.ant_patologicos ?? null, datos.medicamentos_actuales ?? null, datos.alergias ?? null, datos.id_expediente]);
        return { mensaje: 'Expediente actualizado correctamente' };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede editar el expediente" };
    }
};
export const borrarExpediente = async (id_expediente) => {
    try {
        const [existe] = await conexion.query('SELECT id_expediente FROM expediente WHERE id_expediente = ? LIMIT 1', [id_expediente]);
        if (existe.length === 0) {
            return { error: 'No se encuentra el expediente' };
        }
        await conexion.query('DELETE FROM expediente WHERE id_expediente = ?', [id_expediente]);
        return { mensaje: 'Expediente eliminado correctamente' };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede borrar el expediente" };
    }
};
