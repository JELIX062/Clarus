import conexion from '../database/conexion.js';
import bcrypt from 'bcrypt';
import { doctorSchema, editarDoctorSchema } from '../schemas/usuarioSchema.js';
export const obtieneDoctores = async () => {
    try {
        const [results] = await conexion.query(`
            SELECT d.*, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, u.telefono
            FROM doctor d
            INNER JOIN usuario u ON d.id_usuario = u.id_usuario
        `);
        return results;
    }
    catch (err) {
        return { error: "No se puede obtener los doctores" };
    }
};
export const obtieneDoctor = async (id_doctor) => {
    try {
        const [results] = await conexion.query(`
            SELECT d.*, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, u.telefono
            FROM doctor d
            INNER JOIN usuario u ON d.id_usuario = u.id_usuario
            WHERE d.id_doctor = ? LIMIT 1
        `, [id_doctor]);
        return results;
    }
    catch {
        return { error: "No se encuentra el doctor" };
    }
};
export const registraDoctor = async (nuevo) => {
    try {
        const validacion = doctorSchema.safeParse(nuevo);
        if (!validacion.success) {
            return { error: validacion.error };
        }
        const hash = await bcrypt.hash(nuevo.contraseña, 10);
        // 1. Inserta en usuario con id_rol = 2 (Doctor)
        const [result] = await conexion.query('INSERT INTO usuario(id_rol, nombre, apellido_paterno, apellido_materno, correo, telefono, contrasena_hash) values(?,?,?,?,?,?,?)', [2, nuevo.nombre, nuevo.apellido_paterno, nuevo.apellido_materno ?? null, nuevo.correo, nuevo.telefono ?? null, hash]);
        const id_usuario = result.insertId;
        // 2. Inserta en doctor con el id generado
        const [doctor] = await conexion.query('INSERT INTO doctor(id_usuario, id_sucursal, especialidad, rfc, cedula_profesional, tarifa_consulta) values(?,?,?,?,?,?)', [id_usuario, nuevo.id_sucursal, nuevo.especialidad, nuevo.rfc, nuevo.cedula_profesional, nuevo.tarifa_consulta]);
        return { mensaje: 'Doctor registrado correctamente', id_usuario, id_doctor: doctor.insertId };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede registrar el doctor" };
    }
};
export const editaDoctor = async (datos) => {
    try {
        const validacion = editarDoctorSchema.safeParse(datos);
        if (!validacion.success) {
            return { error: validacion.error };
        }
        const [existe] = await conexion.query('SELECT id_doctor FROM doctor WHERE id_doctor = ? AND id_usuario = ? LIMIT 1', [datos.id_doctor, datos.id_usuario]);
        if (existe.length === 0) {
            return { error: 'No se encuentra el doctor o los datos no corresponden' };
        }
        await conexion.query(`UPDATE usuario SET
                nombre = ?,
                apellido_paterno = ?,
                apellido_materno = ?,
                correo = ?,
                telefono = ?
            WHERE id_usuario = ?`, [datos.nombre, datos.apellido_paterno, datos.apellido_materno, datos.correo, datos.telefono, datos.id_usuario]);
        await conexion.query(`UPDATE doctor SET
                especialidad = ?,
                rfc = ?,
                cedula_profesional = ?,
                tarifa_consulta = ?,
                id_sucursal = ?
            WHERE id_doctor = ?`, [datos.especialidad, datos.rfc, datos.cedula_profesional, datos.tarifa_consulta, datos.id_sucursal, datos.id_doctor]);
        return { mensaje: 'Doctor actualizado correctamente' };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede editar el doctor" };
    }
};
export const borrarDoctor = async (id_doctor) => {
    try {
        const [doctor] = await conexion.query('SELECT id_usuario FROM doctor WHERE id_doctor = ? LIMIT 1', [id_doctor]);
        if (doctor.length === 0) {
            return { error: 'No se encuentra el doctor' };
        }
        const id_usuario = doctor[0].id_usuario;
        await conexion.query('DELETE FROM doctor WHERE id_doctor = ?', [id_doctor]);
        await conexion.query('DELETE FROM usuario WHERE id_usuario = ?', [id_usuario]);
        return { mensaje: 'Doctor eliminado correctamente' };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede borrar el doctor" };
    }
};
