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
        // Agrega sucursales a cada doctor
        for (const doc of results) {
            const [suc] = await conexion.query('SELECT id_sucursal FROM doctor_sucursal WHERE id_doctor = ?', [doc.id_doctor]);
            doc.sucursales = suc.map((s) => s.id_sucursal);
        }
        return results;
    }
    catch (err) {
        return { error: 'No se puede obtener los doctores' };
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
        if (results.length === 0)
            return { error: 'No se encuentra el doctor' };
        const [suc] = await conexion.query('SELECT id_sucursal FROM doctor_sucursal WHERE id_doctor = ?', [id_doctor]);
        results[0].sucursales = suc.map((s) => s.id_sucursal);
        return results;
    }
    catch {
        return { error: 'No se encuentra el doctor' };
    }
};
export const registraDoctor = async (nuevo) => {
    try {
        const validacion = doctorSchema.safeParse(nuevo);
        if (!validacion.success)
            return { error: validacion.error };
        const [correoExiste] = await conexion.query('SELECT id_usuario FROM usuario WHERE correo = ? LIMIT 1', [nuevo.correo]);
        if (correoExiste.length > 0)
            return { error: 'Ya existe un usuario con ese correo' };
        const [rfcExiste] = await conexion.query('SELECT id_doctor FROM doctor WHERE rfc = ? LIMIT 1', [nuevo.rfc]);
        if (rfcExiste.length > 0)
            return { error: 'Ya existe un doctor con ese RFC' };
        const hash = await bcrypt.hash(nuevo.contraseña, 10);
        const [result] = await conexion.query('INSERT INTO usuario(id_rol, nombre, apellido_paterno, apellido_materno, correo, telefono, contrasena_hash) VALUES(?,?,?,?,?,?,?)', [2, nuevo.nombre, nuevo.apellido_paterno, nuevo.apellido_materno ?? null, nuevo.correo, nuevo.telefono ?? null, hash]);
        const id_usuario = result.insertId;
        const [doctor] = await conexion.query('INSERT INTO doctor(id_usuario, especialidad, rfc, cedula_profesional, tarifa_consulta) VALUES(?,?,?,?,?)', [id_usuario, nuevo.especialidad, nuevo.rfc, nuevo.cedula_profesional, nuevo.tarifa_consulta]);
        const id_doctor = doctor.insertId;
        // Inserta relaciones con sucursales
        for (const id_sucursal of nuevo.sucursales) {
            await conexion.query('INSERT INTO doctor_sucursal(id_doctor, id_sucursal) VALUES(?,?)', [id_doctor, id_sucursal]);
        }
        return { mensaje: 'Doctor registrado correctamente', id_usuario, id_doctor };
    }
    catch (err) {
        console.log('ERROR EN BD:', err);
        return { error: 'No se puede registrar el doctor' };
    }
};
export const editaDoctor = async (datos) => {
    try {
        const validacion = editarDoctorSchema.safeParse(datos);
        if (!validacion.success)
            return { error: validacion.error };
        const [existe] = await conexion.query('SELECT id_doctor FROM doctor WHERE id_doctor = ? AND id_usuario = ? LIMIT 1', [datos.id_doctor, datos.id_usuario]);
        if (existe.length === 0)
            return { error: 'No se encuentra el doctor' };
        await conexion.query(`UPDATE usuario SET nombre=?, apellido_paterno=?, apellido_materno=?, correo=?, telefono=? WHERE id_usuario=?`, [datos.nombre, datos.apellido_paterno, datos.apellido_materno, datos.correo, datos.telefono, datos.id_usuario]);
        await conexion.query(`UPDATE doctor SET especialidad=?, rfc=?, cedula_profesional=?, tarifa_consulta=? WHERE id_doctor=?`, [datos.especialidad, datos.rfc, datos.cedula_profesional, datos.tarifa_consulta, datos.id_doctor]);
        // Actualiza las sucursales: borra las anteriores e inserta las nuevas
        await conexion.query('DELETE FROM doctor_sucursal WHERE id_doctor = ?', [datos.id_doctor]);
        for (const id_sucursal of datos.sucursales) {
            await conexion.query('INSERT INTO doctor_sucursal(id_doctor, id_sucursal) VALUES(?,?)', [datos.id_doctor, id_sucursal]);
        }
        if (datos.contraseña) {
            const hash = await bcrypt.hash(datos.contraseña, 10);
            await conexion.query('UPDATE usuario SET contrasena_hash=? WHERE id_usuario=?', [hash, datos.id_usuario]);
        }
        return { mensaje: 'Doctor actualizado correctamente' };
    }
    catch (err) {
        console.log('ERROR EN BD:', err);
        return { error: 'No se puede editar el doctor' };
    }
};
export const borrarDoctor = async (id_doctor) => {
    try {
        const [doctor] = await conexion.query('SELECT id_usuario FROM doctor WHERE id_doctor = ? LIMIT 1', [id_doctor]);
        if (doctor.length === 0)
            return { error: 'No se encuentra el doctor' };
        const id_usuario = doctor[0].id_usuario;
        const [citasActivas] = await conexion.query("SELECT id_cita FROM cita WHERE id_doctor = ? AND estado = 'Programada' LIMIT 1", [id_doctor]);
        if (citasActivas.length > 0)
            return { error: 'No se puede eliminar el doctor porque tiene citas programadas activas' };
        await conexion.query(`UPDATE cita SET estado = 'Cancelada' WHERE id_doctor = ? AND estado IN ('Programada', 'En curso')`, [id_doctor]);
        await conexion.query('UPDATE cita SET id_doctor = NULL WHERE id_doctor = ?', [id_doctor]);
        await conexion.query('UPDATE expediente SET id_doctor = NULL WHERE id_doctor = ?', [id_doctor]);
        await conexion.query('UPDATE consultafisica SET id_doctor = NULL WHERE id_doctor = ?', [id_doctor]);
        await conexion.query('DELETE FROM horariodoctor WHERE id_doctor = ?', [id_doctor]);
        await conexion.query('DELETE FROM bloqueohorario WHERE id_doctor = ?', [id_doctor]);
        await conexion.query('DELETE FROM doctor_sucursal WHERE id_doctor = ?', [id_doctor]);
        await conexion.query('DELETE FROM doctor WHERE id_doctor = ?', [id_doctor]);
        await conexion.query('DELETE FROM usuario WHERE id_usuario = ?', [id_usuario]);
        return { mensaje: 'Doctor eliminado correctamente' };
    }
    catch (err) {
        console.log('ERROR EN BD:', err);
        return { error: 'No se puede borrar el doctor' };
    }
};
