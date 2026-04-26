import type { UsuarioNuevo } from './typesUsuarios.js';
import bcrypt from 'bcrypt';
import conexion from '../database/conexion.js';

export const obtieneUsuario = async () => {
    try {
        const [results] = await conexion.query('SELECT * FROM usuario');
        return results;
    } catch(err) {
        return { error: "No se puede obtener el usuario" }
    }
}

export const encuentraUsuario = async (id_usuario: number) => {
    try {
        const [results] = await conexion.query('SELECT * FROM usuario WHERE id_usuario = ? LIMIT 1', [id_usuario]);
        return results;
    } catch {
        return { error: "No se encuentra el usuario" }
    }
}

export const agregaUsuario = async (nuevo: UsuarioNuevo) => {
    try {
        const hash = await bcrypt.hash(nuevo.contraseña, 10);

        const [result]: any = await conexion.query(
            'INSERT INTO usuario(id_rol, nombre, apellido_paterno, apellido_materno, correo, telefono, contrasena_hash) values(?,?,?,?,?,?,?)',
            [4, nuevo.nombre, nuevo.apellido_paterno, nuevo.apellido_materno ?? null, nuevo.correo, nuevo.telefono ?? null, hash]
        );

        const id_usuario = result.insertId;

        await conexion.query(
            'INSERT INTO paciente(id_usuario, fecha_nacimiento, sexo, tipo_sangre, saldo_pendiente) values(?,?,?,?,?)',
            [id_usuario, nuevo.fecha_nacimiento ?? null, nuevo.sexo ?? null, nuevo.tipo_sangre ?? null, 0.00]
        );

        return { mensaje: 'Paciente registrado correctamente', id_usuario };

    } catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: 'No se puede agregar el usuario' };
    }
}