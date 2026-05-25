import conexion from '../database/conexion.js';
import type { Sucursal, SucursalNuevo } from './typesUsuarios.js';
import { sucursalSchema,editarSucursalSchema } from '../schemas/usuarioSchema.js';
import * as notificacionServices from './notificacionServices.js';



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

        const validacion = sucursalSchema.safeParse(nuevo);
        if (!validacion.success) {
            return { error: validacion.error };
        }

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
        const validacion = editarSucursalSchema.safeParse(datos);
        if (!validacion.success) return { error: validacion.error };

        const [existe]: any = await conexion.query(
            'SELECT id_sucursal, nombre, activa FROM sucursal WHERE id_sucursal = ? LIMIT 1',
            [datos.id_sucursal]
        );
        if (existe.length === 0) return { error: 'No se encuentra la sucursal' };

        const estabaActiva  = existe[0].activa
        const nombreSucursal = existe[0].nombre

        await conexion.query(
            `UPDATE sucursal SET nombre=?, calle=?, numero=?, colonia=?, ciudad=?,
             codigo_postal=?, telefono=?, correo=?, activa=? WHERE id_sucursal=?`,
            [datos.nombre, datos.calle, datos.numero, datos.colonia, datos.ciudad,
             datos.codigo_postal, datos.telefono, datos.correo, datos.activa, datos.id_sucursal]
        );

        // Si se está desactivando, cancela citas futuras y devuelve anticipos
        if (estabaActiva && !datos.activa) {
            const [citasFuturas]: any = await conexion.query(`
                SELECT c.id_cita, c.fecha, c.hora_inicio, c.registrado_por,
                       p.id_usuario AS id_usuario_paciente,
                       d.id_usuario AS id_usuario_doctor
                FROM cita c
                INNER JOIN consultorio co ON c.id_consultorio = co.id_consultorio
                INNER JOIN paciente p     ON c.id_paciente    = p.id_paciente
                LEFT  JOIN doctor d       ON c.id_doctor      = d.id_doctor
                WHERE co.id_sucursal = ?
                  AND c.estado       = 'Programada'
                  AND c.fecha        >= CURDATE()
            `, [datos.id_sucursal]);

            for (const cita of citasFuturas) {
                await conexion.query(
                    "UPDATE cita SET estado = 'Cancelada' WHERE id_cita = ?",
                    [cita.id_cita]
                );
                await conexion.query(
                    `INSERT INTO cancelacion(id_cita, cancelado_por, motivo, aplica_reembolso, porcentaje_reembolso)
                     VALUES(?, ?, ?, 1, 100.00)`,
                    [cita.id_cita, cita.registrado_por, `Sucursal ${nombreSucursal} desactivada`]
                );

                // Devuelve el anticipo al saldo del paciente
                const [anticipo]: any = await conexion.query(
                    `SELECT monto FROM pago WHERE id_cita = ? AND tipo_pago = 'Anticipo' AND estado = 'Completado' LIMIT 1`,
                    [cita.id_cita]
                );
                if (anticipo.length > 0) {
                    await conexion.query(
                        'UPDATE paciente SET saldo_pendiente = saldo_pendiente + ? WHERE id_usuario = ?',
                        [anticipo[0].monto, cita.id_usuario_paciente]
                    );
                }

                const fechaStr = typeof cita.fecha === 'string'
                    ? cita.fecha.split('T')[0]
                    : cita.fecha.toISOString().split('T')[0];
                const horaStr  = String(cita.hora_inicio).slice(0, 5);

                await notificacionServices.creaNotificacion({
                    id_usuario: cita.id_usuario_paciente,
                    titulo:     'Cita cancelada por sucursal inactiva',
                    mensaje:    `Tu cita del ${fechaStr} a las ${horaStr} fue cancelada porque la sucursal ${nombreSucursal} fue desactivada. Se devolverá el 100% de tu anticipo.`
                });

                if (cita.id_usuario_doctor) {
                    await notificacionServices.creaNotificacion({
                        id_usuario: cita.id_usuario_doctor,
                        titulo:     'Cita cancelada por sucursal inactiva',
                        mensaje:    `La cita del ${fechaStr} a las ${horaStr} fue cancelada porque la sucursal ${nombreSucursal} fue desactivada.`
                    });
                }
            }
        }

        return { mensaje: 'Sucursal actualizada correctamente' };

    } catch(err) {
        console.log('ERROR EN BD:', err);
        return { error: 'No se puede editar la sucursal' };
    }
}


export const borrarSucursal = async (id_sucursal: number) => {
    try {
        const [existe]: any = await conexion.query(
            'SELECT id_sucursal, nombre FROM sucursal WHERE id_sucursal = ? LIMIT 1',
            [id_sucursal]
        );
        if (existe.length === 0) return { error: 'No se encuentra la sucursal' };

        const nombreSucursal = existe[0].nombre;

        // Obtiene citas futuras programadas en esta sucursal para cancelarlas
        const [citasFuturas]: any = await conexion.query(`
            SELECT c.id_cita, c.fecha, c.hora_inicio, c.registrado_por,
                p.id_usuario AS id_usuario_paciente,
                d.id_usuario AS id_usuario_doctor
            FROM cita c
            INNER JOIN consultorio co ON c.id_consultorio = co.id_consultorio
            INNER JOIN paciente p     ON c.id_paciente    = p.id_paciente
            LEFT  JOIN doctor d       ON c.id_doctor      = d.id_doctor
            WHERE co.id_sucursal = ?
                AND c.estado       = 'Programada'
                AND c.fecha        >= CURDATE()
        `, [id_sucursal]);

        // Cancela las citas futuras e inserta cancelaciones y notificaciones
        for (const cita of citasFuturas) {
            await conexion.query(
                "UPDATE cita SET estado = 'Cancelada' WHERE id_cita = ?",
                [cita.id_cita]
            );

            await conexion.query(
                `INSERT INTO cancelacion(id_cita, cancelado_por, motivo, aplica_reembolso, porcentaje_reembolso)
                VALUES(?, ?, ?, 1, 100.00)`,
                [cita.id_cita, cita.registrado_por, `Sucursal ${nombreSucursal} eliminada`]
            );

            // Devuelve el anticipo al saldo del paciente
            const [anticipo]: any = await conexion.query(
                `SELECT monto FROM pago WHERE id_cita = ? AND tipo_pago = 'Anticipo' AND estado = 'Completado' LIMIT 1`,
                [cita.id_cita]
            )
            if (anticipo.length > 0) {
                await conexion.query(
                    'UPDATE paciente SET saldo_pendiente = saldo_pendiente + ? WHERE id_usuario = ?',
                    [anticipo[0].monto, cita.id_usuario_paciente]
                )
            }

            const fechaStr = typeof cita.fecha === 'string'
                ? cita.fecha.split('T')[0]
                : cita.fecha.toISOString().split('T')[0];
            const horaStr  = String(cita.hora_inicio).slice(0, 5);
            const mensaje  = `Tu cita del ${fechaStr} a las ${horaStr} fue cancelada porque la sucursal ${nombreSucursal} fue eliminada. Se devolverá el 100% de tu anticipo.`;

            await notificacionServices.creaNotificacion({
                id_usuario: cita.id_usuario_paciente,
                titulo:     'Cita cancelada por cierre de sucursal',
                mensaje
            });

            if (cita.id_usuario_doctor) {
                await notificacionServices.creaNotificacion({
                    id_usuario: cita.id_usuario_doctor,
                    titulo:     'Cita cancelada por cierre de sucursal',
                    mensaje:    `La cita del ${fechaStr} a las ${horaStr} fue cancelada porque la sucursal ${nombreSucursal} fue eliminada.`
                });
            }
        }

        // Quita la sucursal de doctor_sucursal
        await conexion.query('DELETE FROM doctor_sucursal WHERE id_sucursal = ?', [id_sucursal]);
        await conexion.query('UPDATE recepcionista SET id_sucursal = NULL WHERE id_sucursal = ?', [id_sucursal]);
        await conexion.query('UPDATE cita SET id_consultorio = NULL WHERE id_consultorio IN (SELECT id_consultorio FROM consultorio WHERE id_sucursal = ?)', [id_sucursal]);
        await conexion.query('DELETE FROM horariodoctor WHERE id_consultorio IN (SELECT id_consultorio FROM consultorio WHERE id_sucursal = ?)', [id_sucursal]);
        await conexion.query('DELETE FROM consultorio WHERE id_sucursal = ?', [id_sucursal]);
        await conexion.query('DELETE FROM sucursal WHERE id_sucursal = ?', [id_sucursal]);

        return { mensaje: 'Sucursal eliminada correctamente' };
    } catch(err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede borrar la sucursal" }
    }
}