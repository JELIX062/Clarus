import conexion from '../database/conexion.js';
import bcrypt from 'bcrypt';
export const obtieneAdministradores = async () => {
    try {
        const [results] = await conexion.query(`
            SELECT a.*, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, u.telefono
            FROM administrador a
            INNER JOIN usuario u ON a.id_usuario = u.id_usuario
        `);
        return results;
    }
    catch (err) {
        return { error: "No se puede obtener los administradores" };
    }
};
export const obtieneAdministrador = async (id_administrador) => {
    try {
        const [results] = await conexion.query(`
            SELECT a.*, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, u.telefono
            FROM administrador a
            INNER JOIN usuario u ON a.id_usuario = u.id_usuario
            WHERE a.id_administrador = ? LIMIT 1
        `, [id_administrador]);
        return results;
    }
    catch {
        return { error: "No se encuentra el administrador" };
    }
};
export const registraAdministrador = async (nuevo) => {
    try {
        const hash = await bcrypt.hash(nuevo.contraseña, 10);
        const [result] = await conexion.query('INSERT INTO usuario(id_rol, nombre, apellido_paterno, apellido_materno, correo, telefono, contrasena_hash) values(?,?,?,?,?,?,?)', [1, nuevo.nombre, nuevo.apellido_paterno, nuevo.apellido_materno ?? null, nuevo.correo, nuevo.telefono ?? null, hash]);
        const id_usuario = result.insertId;
        const [admin] = await conexion.query('INSERT INTO administrador(id_usuario, cargo) values(?,?)', [id_usuario, nuevo.cargo]);
        return { mensaje: 'Administrador registrado correctamente', id_usuario, id_administrador: admin.insertId };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede registrar el administrador" };
    }
};
export const editaAdministrador = async (datos) => {
    try {
        const [existe] = await conexion.query('SELECT id_administrador FROM administrador WHERE id_administrador = ? AND id_usuario = ? LIMIT 1', [datos.id_administrador, datos.id_usuario]);
        if (existe.length === 0) {
            return { error: 'No se encuentra el administrador o los datos no corresponden' };
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
        await conexion.query('UPDATE administrador SET cargo = ? WHERE id_administrador = ?', [datos.cargo, datos.id_administrador]);
        return { mensaje: 'Administrador actualizado correctamente' };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede editar el administrador" };
    }
};
export const borrarAdministrador = async (id_administrador) => {
    try {
        const [admin] = await conexion.query('SELECT id_usuario FROM administrador WHERE id_administrador = ? LIMIT 1', [id_administrador]);
        if (admin.length === 0) {
            return { error: 'No se encuentra el administrador' };
        }
        const id_usuario = admin[0].id_usuario;
        await conexion.query('DELETE FROM administrador WHERE id_administrador = ?', [id_administrador]);
        await conexion.query('DELETE FROM usuario WHERE id_usuario = ?', [id_usuario]);
        return { mensaje: 'Administrador eliminado correctamente' };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede borrar el administrador" };
    }
};
