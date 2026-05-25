import conexion from '../database/conexion.js';
import bcrypt from 'bcrypt';
import { loginSchema } from '../schemas/usuarioSchema.js';
export const obtieneUsuario = async () => {
    try {
        const [results] = await conexion.query('SELECT * FROM usuario');
        return results;
    }
    catch (err) {
        return { error: "No se puede obtener el usuario" };
    }
};
export const encuentraUsuario = async (id_usuario) => {
    try {
        const [results] = await conexion.query('SELECT * FROM usuario WHERE id_usuario = ? LIMIT 1', [id_usuario]);
        return results;
    }
    catch {
        return { error: "No se encuentra el usuario" };
    }
};
export const login = async (correo, contraseña) => {
    try {
        const validacion = loginSchema.safeParse({ correo, contraseña });
        if (!validacion.success) {
            return { error: validacion.error };
        }
        const [usuarios] = await conexion.query(`SELECT u.*, r.nombre as nombre_rol
            FROM usuario u
            INNER JOIN rol r ON u.id_rol = r.id_rol
            WHERE u.correo = ? AND u.activo = 1 LIMIT 1`, [correo]);
        if (usuarios.length === 0) {
            return { error: 'Correo o contraseña incorrectos' };
        }
        const usuario = usuarios[0];
        const contraseñaValida = await bcrypt.compare(contraseña, usuario.contrasena_hash);
        if (!contraseñaValida) {
            return { error: 'Correo o contraseña incorrectos' };
        }
        await conexion.query('UPDATE usuario SET ultimo_acceso = NOW() WHERE id_usuario = ?', [usuario.id_usuario]);
        let datosExtra = {};
        let redireccion = '';
        if (usuario.id_rol === 1) {
            const [admin] = await conexion.query('SELECT id_administrador, cargo FROM administrador WHERE id_usuario = ?', [usuario.id_usuario]);
            datosExtra = admin[0] ?? {};
            redireccion = '/admin/dashboard';
        }
        else if (usuario.id_rol === 2) {
            const [doctor] = await conexion.query(`SELECT d.id_doctor, d.especialidad, d.tarifa_consulta,
                    d.rfc, d.cedula_profesional
                FROM doctor d
                WHERE d.id_usuario = ?`, [usuario.id_usuario]);
            const docData = doctor[0] ?? {};
            // Carga las sucursales del doctor
            const [sucursales] = await conexion.query(`SELECT ds.id_sucursal, s.nombre
                FROM doctor_sucursal ds
                INNER JOIN sucursal s ON ds.id_sucursal = s.id_sucursal
                WHERE ds.id_doctor = ?`, [docData.id_doctor]);
            docData.sucursales = sucursales.map((s) => s.id_sucursal);
            docData.nombres_sucursal = sucursales.map((s) => s.nombre).join(', ');
            datosExtra = docData;
            redireccion = '/citas';
        }
        else if (usuario.id_rol === 3) {
            const [recepcionista] = await conexion.query(`SELECT r.id_recepcionista, r.id_sucursal, r.turno,
                    s.nombre as nombre_sucursal
                FROM recepcionista r
                INNER JOIN sucursal s ON r.id_sucursal = s.id_sucursal
                WHERE r.id_usuario = ?`, [usuario.id_usuario]);
            datosExtra = recepcionista[0] ?? {};
            redireccion = '/recepcionista/dashboard';
        }
        else if (usuario.id_rol === 4) {
            const [paciente] = await conexion.query('SELECT id_paciente, fecha_nacimiento, sexo, tipo_sangre, saldo_pendiente FROM paciente WHERE id_usuario = ?', [usuario.id_usuario]);
            datosExtra = paciente[0] ?? {};
            redireccion = '/paciente/dashboard';
        }
        return {
            mensaje: 'Login exitoso',
            redireccion,
            usuario: {
                id_usuario: usuario.id_usuario,
                id_rol: usuario.id_rol,
                nombre_rol: usuario.nombre_rol,
                nombre: usuario.nombre,
                apellido_paterno: usuario.apellido_paterno,
                apellido_materno: usuario.apellido_materno,
                correo: usuario.correo,
                telefono: usuario.telefono,
                ...datosExtra
            }
        };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede iniciar sesión" };
    }
};
export const obtieneDatosSesion = async (id_usuario) => {
    try {
        const [usuario] = await conexion.query(`SELECT u.*, r.nombre AS nombre_rol FROM usuario u
             INNER JOIN rol r ON u.id_rol = r.id_rol
             WHERE u.id_usuario = ? LIMIT 1`, [id_usuario]);
        if (!usuario.length)
            return { error: 'No se encuentra el usuario' };
        const u = usuario[0];
        // Agrega datos extra según el rol
        if (u.id_rol === 2) {
            const [doctor] = await conexion.query('SELECT * FROM doctor WHERE id_usuario = ? LIMIT 1', [id_usuario]);
            const [sucursales] = await conexion.query(`SELECT ds.id_sucursal FROM doctor_sucursal ds WHERE ds.id_doctor = ?`, [doctor[0]?.id_doctor]);
            Object.assign(u, doctor[0] ?? {});
            u.sucursales = sucursales.map((s) => s.id_sucursal);
        }
        else if (u.id_rol === 3) {
            const [recep] = await conexion.query('SELECT * FROM recepcionista WHERE id_usuario = ? LIMIT 1', [id_usuario]);
            Object.assign(u, recep[0] ?? {});
        }
        else if (u.id_rol === 4) {
            const [paciente] = await conexion.query('SELECT * FROM paciente WHERE id_usuario = ? LIMIT 1', [id_usuario]);
            Object.assign(u, paciente[0] ?? {});
        }
        delete u.contrasena_hash;
        return u;
    }
    catch (err) {
        console.log('ERROR EN BD:', err);
        return { error: 'No se puede obtener los datos de sesión' };
    }
};
