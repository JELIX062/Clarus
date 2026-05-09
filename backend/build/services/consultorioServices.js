import conexion from '../database/conexion.js';
import { consultorioSchema, editarConsultorioSchema } from '../schemas/usuarioSchema.js';
export const obtieneConsultorios = async () => {
    try {
        const [results] = await conexion.query(`
            SELECT c.*, s.nombre as nombre_sucursal
            FROM consultorio c
            INNER JOIN sucursal s ON c.id_sucursal = s.id_sucursal
        `);
        return results;
    }
    catch (err) {
        return { error: "No se puede obtener los consultorios" };
    }
};
export const obtieneConsultorio = async (id_consultorio) => {
    try {
        const [results] = await conexion.query(`
            SELECT c.*, s.nombre as nombre_sucursal
            FROM consultorio c
            INNER JOIN sucursal s ON c.id_sucursal = s.id_sucursal
            WHERE c.id_consultorio = ? LIMIT 1
        `, [id_consultorio]);
        return results;
    }
    catch {
        return { error: "No se encuentra el consultorio" };
    }
};
export const registraConsultorio = async (nuevo) => {
    try {
        const validacion = consultorioSchema.safeParse(nuevo);
        if (!validacion.success) {
            return { error: validacion.error };
        }
        const [result] = await conexion.query('INSERT INTO consultorio(id_sucursal, numero, piso, descripcion, activo) values(?,?,?,?,?)', [nuevo.id_sucursal, nuevo.numero, nuevo.piso, nuevo.descripcion, 1]);
        return { mensaje: 'Consultorio registrado correctamente', id_consultorio: result.insertId };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede registrar el consultorio" };
    }
};
export const editaConsultorio = async (datos) => {
    try {
        const validacion = editarConsultorioSchema.safeParse(datos);
        if (!validacion.success) {
            return { error: validacion.error };
        }
        const [existe] = await conexion.query('SELECT id_consultorio FROM consultorio WHERE id_consultorio = ? LIMIT 1', [datos.id_consultorio]);
        if (existe.length === 0) {
            return { error: 'No se encuentra el consultorio' };
        }
        await conexion.query(`UPDATE consultorio SET
                id_sucursal = ?,
                numero = ?,
                piso = ?,
                descripcion = ?,
                activo = ?
            WHERE id_consultorio = ?`, [datos.id_sucursal, datos.numero, datos.piso, datos.descripcion, datos.activo, datos.id_consultorio]);
        return { mensaje: 'Consultorio actualizado correctamente' };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede editar el consultorio" };
    }
};
export const borrarConsultorio = async (id_consultorio) => {
    try {
        const [existe] = await conexion.query('SELECT id_consultorio FROM consultorio WHERE id_consultorio = ? LIMIT 1', [id_consultorio]);
        if (existe.length === 0) {
            return { error: 'No se encuentra el consultorio' };
        }
        await conexion.query('DELETE FROM consultorio WHERE id_consultorio = ?', [id_consultorio]);
        return { mensaje: 'Consultorio eliminado correctamente' };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede borrar el consultorio" };
    }
};
