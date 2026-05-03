import conexion from '../database/conexion.js';
import bcrypt from 'bcrypt';
export const obtieneRecepcionistas = async () => {
    try {
        const [results] = await conexion.query(`
            SELECT r.*, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, u.telefono
            FROM recepcionista r
            INNER JOIN usuario u ON r.id_usuario = u.id_usuario
        `);
        return results;
    }
    catch (err) {
        return { error: "No se puede obtener las recepcionistas" };
    }
};
export const obtieneRecepcionista = async (id_recepcionista) => {
    try {
        const [results] = await conexion.query(`
            SELECT r.*, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, u.telefono
            FROM recepcionista r
            INNER JOIN usuario u ON r.id_usuario = u.id_usuario
            WHERE r.id_recepcionista = ? LIMIT 1
        `, [id_recepcionista]);
        return results;
    }
    catch {
        return { error: "No se encuentra la recepcionista" };
    }
};
export const registraRecepcionista = async (nuevo) => {
    try {
        const hash = await bcrypt.hash(nuevo.contraseña, 10);
        const [result] = await conexion.query('INSERT INTO usuario(id_rol, nombre, apellido_paterno, apellido_materno, correo, telefono, contrasena_hash) values(?,?,?,?,?,?,?)', [3, nuevo.nombre, nuevo.apellido_paterno, nuevo.apellido_materno ?? null, nuevo.correo, nuevo.telefono ?? null, hash]);
        const id_usuario = result.insertId;
        const [recepcionista] = await conexion.query('INSERT INTO recepcionista(id_usuario, id_sucursal, turno) values(?,?,?)', [id_usuario, nuevo.id_sucursal, nuevo.turno]);
        return { mensaje: 'Recepcionista registrada correctamente', id_usuario, id_recepcionista: recepcionista.insertId };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede registrar la recepcionista" };
    }
};
export const editaRecepcionista = async (datos) => {
    try {
        const [existe] = await conexion.query('SELECT id_recepcionista FROM recepcionista WHERE id_recepcionista = ? AND id_usuario = ? LIMIT 1', [datos.id_recepcionista, datos.id_usuario]);
        if (existe.length === 0) {
            return { error: 'No se encuentra la recepcionista o los datos no corresponden' };
        }
        let queryUsuario = `UPDATE usuario SET
                nombre = ?,
                apellido_paterno = ?,
                apellido_materno = ?,
                correo = ?,
                telefono = ?`;
        let paramsUsuario = [datos.nombre, datos.apellido_paterno, datos.apellido_materno, datos.correo, datos.telefono];
        if (datos.contraseña) {
            const hash = await bcrypt.hash(datos.contraseña, 10);
            queryUsuario += ', contrasena_hash = ?';
            paramsUsuario.push(hash);
        }
        queryUsuario += ' WHERE id_usuario = ?';
        paramsUsuario.push(datos.id_usuario);
        await conexion.query(queryUsuario, paramsUsuario);
        await conexion.query(`UPDATE recepcionista SET
                id_sucursal = ?,
                turno = ?
            WHERE id_recepcionista = ?`, [datos.id_sucursal, datos.turno, datos.id_recepcionista]);
        return { mensaje: 'Recepcionista actualizada correctamente' };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede editar la recepcionista" };
    }
};
export const borrarRecepcionista = async (id_recepcionista) => {
    try {
        const [recepcionista] = await conexion.query('SELECT id_usuario FROM recepcionista WHERE id_recepcionista = ? LIMIT 1', [id_recepcionista]);
        if (recepcionista.length === 0) {
            return { error: 'No se encuentra la recepcionista' };
        }
        const id_usuario = recepcionista[0].id_usuario;
        await conexion.query('DELETE FROM recepcionista WHERE id_recepcionista = ?', [id_recepcionista]);
        await conexion.query('DELETE FROM usuario WHERE id_usuario = ?', [id_usuario]);
        return { mensaje: 'Recepcionista eliminada correctamente' };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede borrar la recepcionista" };
    }
};
