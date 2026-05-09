import conexion from '../database/conexion.js';
import bcrypt from 'bcrypt';
import { loginSchema } from '../schemas/usuarioSchema.js';


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

export const login = async (correo: string, contraseña: string) => {
    try {

        const validacion = loginSchema.safeParse({ correo, contraseña });
        if (!validacion.success) {
            return { error: validacion.error };
        }
        const [usuarios]: any = await conexion.query(
            `SELECT u.*, r.nombre as nombre_rol
            FROM usuario u
            INNER JOIN rol r ON u.id_rol = r.id_rol
            WHERE u.correo = ? AND u.activo = 1 LIMIT 1`,
            [correo]
        );

        if (usuarios.length === 0) {
            return { error: 'Correo o contraseña incorrectos' };
        }

        const usuario = usuarios[0];

        const contraseñaValida = await bcrypt.compare(contraseña, usuario.contrasena_hash);

        if (!contraseñaValida) {
            return { error: 'Correo o contraseña incorrectos' };
        }

        await conexion.query(
            'UPDATE usuario SET ultimo_acceso = NOW() WHERE id_usuario = ?',
            [usuario.id_usuario]
        );

        let datosExtra = {};
        let redireccion = '';

        if (usuario.id_rol === 1) {
            const [admin]: any = await conexion.query(
                'SELECT id_administrador, cargo FROM administrador WHERE id_usuario = ?',
                [usuario.id_usuario]
            );
            datosExtra = admin[0] ?? {};
            redireccion = '/admin/dashboard';

        } else if (usuario.id_rol === 2) {
            const [doctor]: any = await conexion.query(
                'SELECT id_doctor, especialidad, tarifa_consulta, id_sucursal FROM doctor WHERE id_usuario = ?',
                [usuario.id_usuario]
            );
            datosExtra = doctor[0] ?? {};
            redireccion = '/doctor/dashboard';

        } else if (usuario.id_rol === 3) {
            const [recepcionista]: any = await conexion.query(
                'SELECT id_recepcionista, id_sucursal, turno FROM recepcionista WHERE id_usuario = ?',
                [usuario.id_usuario]
            );
            datosExtra = recepcionista[0] ?? {};
            redireccion = '/recepcionista/dashboard';

        } else if (usuario.id_rol === 4) {
            const [paciente]: any = await conexion.query(
                'SELECT id_paciente, fecha_nacimiento, sexo, tipo_sangre, saldo_pendiente FROM paciente WHERE id_usuario = ?',
                [usuario.id_usuario]
            );
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

    } catch(err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede iniciar sesión" }
    }
}