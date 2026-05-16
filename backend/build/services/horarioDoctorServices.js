import conexion from '../database/conexion.js';
import { horarioDoctorSchema, editarHorarioDoctorSchema } from '../schemas/usuarioSchema.js';
export const obtieneHorarios = async () => {
    try {
        const [results] = await conexion.query(`
            SELECT h.*, 
                u.nombre as nombre_doctor, u.apellido_paterno as apellido_doctor,
                c.numero as numero_consultorio, s.nombre as nombre_sucursal
            FROM horariodoctor h
            INNER JOIN doctor d ON h.id_doctor = d.id_doctor
            INNER JOIN usuario u ON d.id_usuario = u.id_usuario
            INNER JOIN consultorio c ON h.id_consultorio = c.id_consultorio
            INNER JOIN sucursal s ON c.id_sucursal = s.id_sucursal
        `);
        return results;
    }
    catch (err) {
        return { error: "No se puede obtener los horarios" };
    }
};
export const obtieneHorariosPorDoctor = async (id_doctor) => {
    try {
        const [results] = await conexion.query(`
            SELECT hd.*, c.numero as numero_consultorio, s.nombre as nombre_sucursal
            FROM horariodoctor hd
            INNER JOIN consultorio c ON hd.id_consultorio = c.id_consultorio
            INNER JOIN sucursal s ON c.id_sucursal = s.id_sucursal
            WHERE hd.id_doctor = ? AND hd.activo = 1
            ORDER BY hd.dia_semana
        `, [id_doctor]);
        return results;
    }
    catch {
        return { error: "No se encuentran los horarios del doctor" };
    }
};
export const registraHorario = async (nuevo) => {
    try {
        const validacion = horarioDoctorSchema.safeParse(nuevo);
        if (!validacion.success) {
            return { error: validacion.error };
        }
        const [result] = await conexion.query('INSERT INTO horariodoctor(id_doctor, id_consultorio, dia_semana, hora_inicio, hora_fin, activo) values(?,?,?,?,?,?)', [nuevo.id_doctor, nuevo.id_consultorio, nuevo.dia_semana, nuevo.hora_inicio, nuevo.hora_fin, 1]);
        return { mensaje: 'Horario registrado correctamente', id_horario: result.insertId };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede registrar el horario" };
    }
};
export const editaHorario = async (datos) => {
    try {
        const validacion = editarHorarioDoctorSchema.safeParse(datos);
        if (!validacion.success) {
            return { error: validacion.error };
        }
        const [existe] = await conexion.query('SELECT id_horario FROM horariodoctor WHERE id_horario = ? LIMIT 1', [datos.id_horario]);
        if (existe.length === 0) {
            return { error: 'No se encuentra el horario' };
        }
        await conexion.query(`UPDATE horariodoctor SET
                id_consultorio = ?,
                dia_semana = ?,
                hora_inicio = ?,
                hora_fin = ?,
                activo = ?
            WHERE id_horario = ?`, [datos.id_consultorio, datos.dia_semana, datos.hora_inicio, datos.hora_fin, datos.activo, datos.id_horario]);
        return { mensaje: 'Horario actualizado correctamente' };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede editar el horario" };
    }
};
export const borrarHorario = async (id_horario) => {
    try {
        const [existe] = await conexion.query('SELECT id_horario FROM horariodoctor WHERE id_horario = ? LIMIT 1', [id_horario]);
        if (existe.length === 0) {
            return { error: 'No se encuentra el horario' };
        }
        await conexion.query('DELETE FROM horariodoctor WHERE id_horario = ?', [id_horario]);
        return { mensaje: 'Horario eliminado correctamente' };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede borrar el horario" };
    }
};
