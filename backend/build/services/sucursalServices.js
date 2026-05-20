import conexion from '../database/conexion.js';
import { sucursalSchema, editarSucursalSchema } from '../schemas/usuarioSchema.js';
export const obtieneSucursales = async () => {
    try {
        const [results] = await conexion.query('SELECT * FROM sucursal');
        return results;
    }
    catch (err) {
        return { error: "No se puede obtener las sucursales" };
    }
};
export const obtieneSucursal = async (id_sucursal) => {
    try {
        const [results] = await conexion.query('SELECT * FROM sucursal WHERE id_sucursal = ? LIMIT 1', [id_sucursal]);
        return results;
    }
    catch {
        return { error: "No se encuentra la sucursal" };
    }
};
export const registraSucursal = async (nuevo) => {
    try {
        const validacion = sucursalSchema.safeParse(nuevo);
        if (!validacion.success) {
            return { error: validacion.error };
        }
        const [result] = await conexion.query('INSERT INTO sucursal(id_administrador, nombre, calle, numero, colonia, ciudad, codigo_postal, telefono, correo, activa) values(?,?,?,?,?,?,?,?,?,?)', [nuevo.id_administrador, nuevo.nombre, nuevo.calle, nuevo.numero, nuevo.colonia, nuevo.ciudad, nuevo.codigo_postal, nuevo.telefono, nuevo.correo, 1]);
        return { mensaje: 'Sucursal registrada correctamente', id_sucursal: result.insertId };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede registrar la sucursal" };
    }
};
export const editaSucursal = async (datos) => {
    try {
        const validacion = editarSucursalSchema.safeParse(datos);
        if (!validacion.success) {
            return { error: validacion.error };
        }
        const [existe] = await conexion.query('SELECT id_sucursal FROM sucursal WHERE id_sucursal = ? LIMIT 1', [datos.id_sucursal]);
        if (existe.length === 0) {
            return { error: 'No se encuentra la sucursal' };
        }
        await conexion.query(`UPDATE sucursal SET
                nombre = ?,
                calle = ?,
                numero = ?,
                colonia = ?,
                ciudad = ?,
                codigo_postal = ?,
                telefono = ?,
                correo = ?,
                activa = ?
            WHERE id_sucursal = ?`, [datos.nombre, datos.calle, datos.numero, datos.colonia, datos.ciudad, datos.codigo_postal, datos.telefono, datos.correo, datos.activa, datos.id_sucursal]);
        return { mensaje: 'Sucursal actualizada correctamente' };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede editar la sucursal" };
    }
};
export const borrarSucursal = async (id_sucursal) => {
    try {
        const [existe] = await conexion.query('SELECT id_sucursal FROM sucursal WHERE id_sucursal = ? LIMIT 1', [id_sucursal]);
        if (existe.length === 0)
            return { error: 'No se encuentra la sucursal' };
        // Quitar al doctor de esta sucursal en doctor_sucursal
        await conexion.query('DELETE FROM doctor_sucursal WHERE id_sucursal = ?', [id_sucursal]);
        await conexion.query('UPDATE recepcionista SET id_sucursal = NULL WHERE id_sucursal = ?', [id_sucursal]);
        await conexion.query('UPDATE cita SET id_consultorio = NULL WHERE id_consultorio IN (SELECT id_consultorio FROM consultorio WHERE id_sucursal = ?)', [id_sucursal]);
        await conexion.query('DELETE FROM horariodoctor WHERE id_consultorio IN (SELECT id_consultorio FROM consultorio WHERE id_sucursal = ?)', [id_sucursal]);
        await conexion.query('DELETE FROM consultorio WHERE id_sucursal = ?', [id_sucursal]);
        await conexion.query('DELETE FROM sucursal WHERE id_sucursal = ?', [id_sucursal]);
        return { mensaje: 'Sucursal eliminada correctamente' };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede borrar la sucursal" };
    }
};
