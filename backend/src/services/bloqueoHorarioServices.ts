import conexion from '../database/conexion.js';
import type { BloqueoHorarioNuevo } from './typesUsuarios.js';
import { bloqueoHorarioSchema } from '../schemas/usuarioSchema.js';


export const obtieneBloqueos = async () => {
    try {
        const [results] = await conexion.query(`
            SELECT b.*,
                u.nombre as nombre_doctor, u.apellido_paterno as apellido_doctor
            FROM bloqueohorario b
            INNER JOIN doctor d ON b.id_doctor = d.id_doctor
            INNER JOIN usuario u ON d.id_usuario = u.id_usuario
        `);
        return results;
    } catch(err) {
        return { error: "No se puede obtener los bloqueos" }
    }
}

export const obtieneBloqueosPorDoctor = async (id_doctor: number) => {
    try {
        const [results] = await conexion.query(`
            SELECT b.*
            FROM bloqueohorario b
            WHERE b.id_doctor = ?
        `, [id_doctor]);
        return results;
    } catch {
        return { error: "No se encuentran los bloqueos del doctor" }
    }
}

export const registraBloqueo = async (nuevo: BloqueoHorarioNuevo) => {
    try {
        const validacion = bloqueoHorarioSchema.safeParse(nuevo);
        if (!validacion.success) {
            return { error: validacion.error };
        }

        const [result]: any = await conexion.query(
            'INSERT INTO bloqueohorario(id_doctor, fecha, hora_inicio, hora_fin, motivo, creado_por) values(?,?,?,?,?,?)',
            [nuevo.id_doctor, nuevo.fecha, nuevo.hora_inicio, nuevo.hora_fin, nuevo.motivo, nuevo.creado_por]
        );
        return { mensaje: 'Bloqueo registrado correctamente', id_bloqueo: result.insertId };
    } catch(err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede registrar el bloqueo" }
    }
}

export const borrarBloqueo = async (id_bloqueo: number) => {
    try {
        const [existe]: any = await conexion.query(
            'SELECT id_bloqueo FROM bloqueohorario WHERE id_bloqueo = ? LIMIT 1',
            [id_bloqueo]
        );

        if (existe.length === 0) {
            return { error: 'No se encuentra el bloqueo' };
        }

        await conexion.query('DELETE FROM bloqueohorario WHERE id_bloqueo = ?', [id_bloqueo]);

        return { mensaje: 'Bloqueo eliminado correctamente' };

    } catch(err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede borrar el bloqueo" }
    }
}