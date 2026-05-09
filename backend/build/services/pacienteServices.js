import conexion from '../database/conexion.js';
import bcrypt from 'bcrypt';
import { pacienteSchema, editarPacienteSchema } from '../schemas/usuarioSchema.js';
export const obtienePacientes = async () => {
    try {
        const [results] = await conexion.query(`
            SELECT p.*, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, u.telefono
            FROM paciente p
            INNER JOIN usuario u ON p.id_usuario = u.id_usuario
        `);
        return results;
    }
    catch (err) {
        return { error: "No se puede obtener los pacientes" };
    }
};
export const encuentraPaciente = async (id_paciente) => {
    try {
        const [results] = await conexion.query(`
            SELECT p.*, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, u.telefono
            FROM paciente p
            INNER JOIN usuario u ON p.id_usuario = u.id_usuario
            WHERE p.id_paciente = ? LIMIT 1
        `, [id_paciente]);
        return results;
    }
    catch {
        return { error: "No se encuentra el paciente" };
    }
};
export const agregaPaciente = async (nuevo) => {
    try {
        const validacion = pacienteSchema.safeParse(nuevo);
        if (!validacion.success) {
            return { error: validacion.error };
        }
        const hash = await bcrypt.hash(nuevo.contraseña, 10);
        const [result] = await conexion.query('INSERT INTO usuario(id_rol, nombre, apellido_paterno, apellido_materno, correo, telefono, contrasena_hash) values(?,?,?,?,?,?,?)', [4, nuevo.nombre, nuevo.apellido_paterno, nuevo.apellido_materno ?? null, nuevo.correo, nuevo.telefono ?? null, hash]);
        const id_usuario = result.insertId;
        await conexion.query('INSERT INTO paciente(id_usuario, fecha_nacimiento, sexo, tipo_sangre, saldo_pendiente) values(?,?,?,?,?)', [id_usuario, nuevo.fecha_nacimiento ?? null, nuevo.sexo ?? null, nuevo.tipo_sangre ?? null, 0.00]);
        return { mensaje: 'Paciente registrado correctamente', id_usuario };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: 'No se puede agregar el usuario' };
    }
};
export const editaPaciente = async (datos) => {
    try {
        const validacion = editarPacienteSchema.safeParse(datos);
        if (!validacion.success) {
            return { error: validacion.error };
        }
        const [existe] = await conexion.query('SELECT id_paciente FROM paciente WHERE id_paciente = ? AND id_usuario = ? LIMIT 1', [datos.id_paciente, datos.id_usuario]);
        if (existe.length === 0) {
            return { error: 'No se encuentra el paciente o los datos no corresponden' };
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
        queryUsuario += ' WHERE id_usuario = (SELECT id_usuario FROM paciente WHERE id_paciente = ?)';
        paramsUsuario.push(datos.id_paciente);
        await conexion.query(queryUsuario, paramsUsuario);
        await conexion.query(`UPDATE paciente SET
                fecha_nacimiento = ?,
                sexo = ?,
                tipo_sangre = ?
            WHERE id_paciente = ?`, [datos.fecha_nacimiento, datos.sexo, datos.tipo_sangre, datos.id_paciente]);
        return { mensaje: 'Paciente actualizado correctamente' };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede editar el paciente" };
    }
};
export const borrarPaciente = async (id_paciente) => {
    try {
        // Obtiene el id_usuario antes de borrar
        const [paciente] = await conexion.query('SELECT id_usuario FROM paciente WHERE id_paciente = ? LIMIT 1', [id_paciente]);
        if (paciente.length === 0) {
            return { error: 'No se encuentra el paciente' };
        }
        const id_usuario = paciente[0].id_usuario;
        // Borra primero el paciente por la llave foránea
        await conexion.query('DELETE FROM paciente WHERE id_paciente = ?', [id_paciente]);
        // Borra el usuario
        await conexion.query('DELETE FROM usuario WHERE id_usuario = ?', [id_usuario]);
        return { mensaje: 'Paciente eliminado correctamente' };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede borrar el paciente" };
    }
};
