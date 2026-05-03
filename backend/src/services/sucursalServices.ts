import conexion from '../database/conexion.js';
import type { Sucursal, SucursalNuevo } from './typesUsuarios.js';

export const obtieneSucursales = async () => {
    try {
        const [results] = await conexion.query('SELECT * FROM sucursal');
        return results;
    } catch(err) {
        return { error: "No se puede obtener las sucursales" }
    }
}

export const obtieneSucursal = async (id_sucursal: number) => {
    try {
        const [results] = await conexion.query(
            'SELECT * FROM sucursal WHERE id_sucursal = ? LIMIT 1',
            [id_sucursal]
        );
        return results;
    } catch {
        return { error: "No se encuentra la sucursal" }
    }
}

export const registraSucursal = async (nuevo: SucursalNuevo) => {
    try {
        const [result]: any = await conexion.query(
            'INSERT INTO sucursal(id_administrador, nombre, calle, numero, colonia, ciudad, codigo_postal, telefono, correo, activa) values(?,?,?,?,?,?,?,?,?,?)',
            [nuevo.id_administrador, nuevo.nombre, nuevo.calle, nuevo.numero, nuevo.colonia, nuevo.ciudad, nuevo.codigo_postal, nuevo.telefono, nuevo.correo, 1]
        );
        return { mensaje: 'Sucursal registrada correctamente', id_sucursal: result.insertId };
    } catch(err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede registrar la sucursal" }
    }
}

export const editaSucursal = async (datos: Sucursal) => {
    try {
        const [existe]: any = await conexion.query(
            'SELECT id_sucursal FROM sucursal WHERE id_sucursal = ? LIMIT 1',
            [datos.id_sucursal]
        );

        if (existe.length === 0) {
            return { error: 'No se encuentra la sucursal' };
        }

        await conexion.query(
            `UPDATE sucursal SET
                nombre = ?,
                calle = ?,
                numero = ?,
                colonia = ?,
                ciudad = ?,
                codigo_postal = ?,
                telefono = ?,
                correo = ?,
                activa = ?
            WHERE id_sucursal = ?`,
            [datos.nombre, datos.calle, datos.numero, datos.colonia, datos.ciudad, datos.codigo_postal, datos.telefono, datos.correo, datos.activa, datos.id_sucursal]
        );

        return { mensaje: 'Sucursal actualizada correctamente' };

    } catch(err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede editar la sucursal" }
    }
}

export const borrarSucursal = async (id_sucursal: number) => {
    try {
        const [existe]: any = await conexion.query(
            'SELECT id_sucursal FROM sucursal WHERE id_sucursal = ? LIMIT 1',
            [id_sucursal]
        );

        if (existe.length === 0) {
            return { error: 'No se encuentra la sucursal' };
        }

        await conexion.query('DELETE FROM sucursal WHERE id_sucursal = ?', [id_sucursal]);

        return { mensaje: 'Sucursal eliminada correctamente' };

    } catch(err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede borrar la sucursal" }
    }
}