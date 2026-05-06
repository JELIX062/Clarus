import conexion from '../database/conexion.js';
import type { NotificacionNuevo } from './typesUsuarios.js';

export const creaNotificacion = async (nuevo: NotificacionNuevo) => {
    try {
        const [result]: any = await conexion.query(
            'INSERT INTO notificacion(id_usuario, titulo, mensaje) values(?,?,?)',
            [nuevo.id_usuario, nuevo.titulo, nuevo.mensaje]
        );
        return { mensaje: 'Notificacion creada', id_notificacion: result.insertId };
    } catch(err) {
        console.log("ERROR AL CREAR NOTIFICACION:", err);
        return { error: "No se pudo crear la notificacion" }
    }
}

export const obtieneNotificaciones = async (id_usuario: number) => {
    try {
        const [results] = await conexion.query(
            'SELECT * FROM notificacion WHERE id_usuario = ? ORDER BY fecha_creacion DESC',
            [id_usuario]
        );
        return results;
    } catch(err) {
        return { error: "No se puede obtener las notificaciones" }
    }
}

export const obtieneNotificacionesNoLeidas = async (id_usuario: number) => {
    try {
        const [results] = await conexion.query(
            'SELECT * FROM notificacion WHERE id_usuario = ? AND leida = 0 ORDER BY fecha_creacion DESC',
            [id_usuario]
        );
        return results;
    } catch(err) {
        return { error: "No se puede obtener las notificaciones" }
    }
}

export const marcaNotificacionLeida = async (id_notificacion: number, id_usuario: number) => {
    try {
        const [existe]: any = await conexion.query(
            'SELECT id_notificacion FROM notificacion WHERE id_notificacion = ? AND id_usuario = ? LIMIT 1',
            [id_notificacion, id_usuario]
        );

        if (existe.length === 0) {
            return { error: 'No se encuentra la notificacion' };
        }

        await conexion.query(
            'UPDATE notificacion SET leida = 1 WHERE id_notificacion = ?',
            [id_notificacion]
        );

        return { mensaje: 'Notificacion marcada como leida' };
    } catch(err) {
        return { error: "No se puede marcar la notificacion" }
    }
}

export const marcaTodasLeidas = async (id_usuario: number) => {
    try {
        await conexion.query(
            'UPDATE notificacion SET leida = 1 WHERE id_usuario = ? AND leida = 0',
            [id_usuario]
        );
        return { mensaje: 'Todas las notificaciones marcadas como leidas' };
    } catch(err) {
        return { error: "No se puede marcar las notificaciones" }
    }
}

export const borraNotificacion = async (id_notificacion: number, id_usuario: number) => {
    try {
        const [existe]: any = await conexion.query(
            'SELECT id_notificacion FROM notificacion WHERE id_notificacion = ? AND id_usuario = ? LIMIT 1',
            [id_notificacion, id_usuario]
        );

        if (existe.length === 0) {
            return { error: 'No se encuentra la notificacion' };
        }

        await conexion.query(
            'DELETE FROM notificacion WHERE id_notificacion = ?',
            [id_notificacion]
        );

        return { mensaje: 'Notificacion eliminada correctamente' };
    } catch(err) {
        return { error: "No se puede borrar la notificacion" }
    }
}