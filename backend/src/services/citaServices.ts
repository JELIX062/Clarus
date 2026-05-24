import conexion from '../database/conexion.js';
import type { Cita, CitaNuevo } from './typesUsuarios.js';
import * as notificacionServices from './notificacionServices.js';
import { citaSchema,editarCitaSchema,actualizarEstadoCitaSchema  } from '../schemas/usuarioSchema.js';


export const obtieneCitas = async () => {
    try {
        const [results] = await conexion.query(`
            SELECT c.*,
                up.nombre as nombre_paciente, up.apellido_paterno as apellido_paciente,
                ud.nombre as nombre_doctor, ud.apellido_paterno as apellido_doctor,
                co.numero as numero_consultorio, s.nombre as nombre_sucursal,
                ca.motivo as motivo_cancelacion,
                ca.fecha_cancelacion,
                ca.aplica_reembolso,
                ca.porcentaje_reembolso
            FROM cita c
            INNER JOIN paciente p ON c.id_paciente = p.id_paciente
            INNER JOIN usuario up ON p.id_usuario = up.id_usuario
            INNER JOIN doctor d ON c.id_doctor = d.id_doctor
            INNER JOIN usuario ud ON d.id_usuario = ud.id_usuario
            INNER JOIN consultorio co ON c.id_consultorio = co.id_consultorio
            INNER JOIN sucursal s ON co.id_sucursal = s.id_sucursal
            LEFT JOIN cancelacion ca ON c.id_cita = ca.id_cita
        `);
        return results;
    } catch(err) {
        return { error: "No se puede obtener las citas" }
    }
}

export const obtieneCita = async (id_cita: number) => {
    try {
        const [results] = await conexion.query(`
            SELECT c.*,
                up.nombre as nombre_paciente, up.apellido_paterno as apellido_paciente,
                ud.nombre as nombre_doctor, ud.apellido_paterno as apellido_doctor,
                co.numero as numero_consultorio, s.nombre as nombre_sucursal,
                ca.motivo as motivo_cancelacion,
                ca.fecha_cancelacion,
                ca.aplica_reembolso,
                ca.porcentaje_reembolso
            FROM cita c
            INNER JOIN paciente p ON c.id_paciente = p.id_paciente
            INNER JOIN usuario up ON p.id_usuario = up.id_usuario
            INNER JOIN doctor d ON c.id_doctor = d.id_doctor
            INNER JOIN usuario ud ON d.id_usuario = ud.id_usuario
            INNER JOIN consultorio co ON c.id_consultorio = co.id_consultorio
            INNER JOIN sucursal s ON co.id_sucursal = s.id_sucursal
            LEFT JOIN cancelacion ca ON c.id_cita = ca.id_cita
            WHERE c.id_cita = ? LIMIT 1
        `, [id_cita]);
        return results;
    } catch {
        return { error: "No se encuentra la cita" }
    }
}

export const obtieneCitasPorSucursal = async (id_sucursal: number) => {
    try {
        await conexion.query(`
            UPDATE cita SET estado = 'No atendida'
            WHERE estado = 'Programada'
            AND CONCAT(fecha, ' ', hora_fin) < NOW()
        `)

        const [results] = await conexion.query(`
            SELECT c.*,
                up.nombre as nombre_paciente, up.apellido_paterno as apellido_paciente,
                ud.nombre as nombre_doctor, ud.apellido_paterno as apellido_doctor,
                d.especialidad,
                co.numero as numero_consultorio, s.nombre as nombre_sucursal,
                ca.motivo as motivo_cancelacion,
                ca.fecha_cancelacion,
                ca.aplica_reembolso,
                ca.porcentaje_reembolso
            FROM cita c
            INNER JOIN paciente p ON c.id_paciente = p.id_paciente
            INNER JOIN usuario up ON p.id_usuario = up.id_usuario
            INNER JOIN doctor d ON c.id_doctor = d.id_doctor
            INNER JOIN usuario ud ON d.id_usuario = ud.id_usuario
            INNER JOIN consultorio co ON c.id_consultorio = co.id_consultorio
            INNER JOIN sucursal s ON co.id_sucursal = s.id_sucursal
            LEFT JOIN cancelacion ca ON c.id_cita = ca.id_cita
            WHERE co.id_sucursal = ?
            ORDER BY c.fecha DESC, c.hora_inicio ASC
        `, [id_sucursal])
        return results
    } catch {
        return { error: 'No se pueden obtener las citas de la sucursal' }
    }
}

export const obtieneCitasPorPaciente = async (id_paciente: number) => {
    try {
        // Marca como No atendida las citas programadas cuya hora ya pasó
        await conexion.query(`
            UPDATE cita 
            SET estado = 'No atendida'
            WHERE estado = 'Programada'
            AND CONCAT(fecha, ' ', hora_fin) < NOW()
        `)

        const [results] = await conexion.query(`
            SELECT c.*,
                ud.nombre as nombre_doctor, ud.apellido_paterno as apellido_doctor,
                co.numero as numero_consultorio, s.nombre as nombre_sucursal,
                ca.motivo as motivo_cancelacion,
                ca.fecha_cancelacion,
                ca.aplica_reembolso,
                ca.porcentaje_reembolso
            FROM cita c
            INNER JOIN doctor d ON c.id_doctor = d.id_doctor
            INNER JOIN usuario ud ON d.id_usuario = ud.id_usuario
            INNER JOIN consultorio co ON c.id_consultorio = co.id_consultorio
            INNER JOIN sucursal s ON co.id_sucursal = s.id_sucursal
            LEFT JOIN cancelacion ca ON c.id_cita = ca.id_cita
            WHERE c.id_paciente = ?
        `, [id_paciente]);
        return results;
    } catch {
        return { error: "No se encuentran las citas del paciente" }
    }
}

export const obtieneCitasPorDoctor = async (id_doctor: number) => {
    try {

        // Marca como No atendida las citas programadas cuya hora ya pasó
        await conexion.query(`
            UPDATE cita 
            SET estado = 'No atendida'
            WHERE estado = 'Programada'
            AND CONCAT(fecha, ' ', hora_fin) < NOW()
        `)
        const [results] = await conexion.query(`
            SELECT c.*,
                up.nombre as nombre_paciente, up.apellido_paterno as apellido_paciente,
                co.numero as numero_consultorio, s.nombre as nombre_sucursal,
                ca.motivo as motivo_cancelacion,
                ca.fecha_cancelacion,
                ca.aplica_reembolso,
                ca.porcentaje_reembolso
            FROM cita c
            INNER JOIN paciente p ON c.id_paciente = p.id_paciente
            INNER JOIN usuario up ON p.id_usuario = up.id_usuario
            INNER JOIN consultorio co ON c.id_consultorio = co.id_consultorio
            INNER JOIN sucursal s ON co.id_sucursal = s.id_sucursal
            LEFT JOIN cancelacion ca ON c.id_cita = ca.id_cita
            WHERE c.id_doctor = ?
        `, [id_doctor]);
        return results;
    } catch {
        return { error: "No se encuentran las citas del doctor" }
    }
}

export const registraCita = async (nuevo: CitaNuevo & { metodo_pago: string; referencia?: string | null }) => {
    try {

        const validacion = citaSchema.safeParse(nuevo);
        if (!validacion.success) {
            return { error: validacion.error };
        }
        const diaSemana = new Date(nuevo.fecha + "T00:00:00").getDay();

        const [horario]: any = await conexion.query(
            `SELECT id_horario FROM horariodoctor 
            WHERE id_doctor = ? AND dia_semana = ? AND activo = 1
            AND hora_inicio <= ? AND hora_fin >= ?`,
            [nuevo.id_doctor, diaSemana, nuevo.hora_inicio, nuevo.hora_fin]
        );

        if (horario.length === 0) {
            return { error: 'El doctor no tiene horario disponible en ese dia y hora' };
        }

        const [bloqueo]: any = await conexion.query(
            `SELECT id_bloqueo FROM bloqueohorario
            WHERE id_doctor = ?
            AND CONCAT(fecha_inicio, ' ', hora_inicio) < CONCAT(?, ' ', ?)
            AND CONCAT(fecha_fin,    ' ', hora_fin)    > CONCAT(?, ' ', ?)`,
            [nuevo.id_doctor, nuevo.fecha, nuevo.hora_fin, nuevo.fecha, nuevo.hora_inicio]
        )

        if (bloqueo.length > 0) {
            return { error: 'El doctor tiene un bloqueo en ese horario' };
        }

        const [citaExistente]: any = await conexion.query(
            `SELECT id_cita FROM cita
            WHERE id_doctor = ? AND fecha = ? 
            AND estado NOT IN ('Cancelada', 'No atendida', 'Finalizada')
            AND hora_inicio < ? AND hora_fin > ?`,
            [nuevo.id_doctor, nuevo.fecha, nuevo.hora_fin, nuevo.hora_inicio]
        );

        if (citaExistente.length > 0) {
            return { error: 'El doctor ya tiene una cita en ese horario' };
        }

        

        // Registra la cita
        const [result]: any = await conexion.query(
            `INSERT INTO cita(id_paciente, id_doctor, id_consultorio, id_recepcionista, fecha, hora_inicio, hora_fin, estado, motivo_consulta, costo_total, registrado_por)
            values(?,?,?,?,?,?,?,?,?,?,?)`,
            [nuevo.id_paciente, nuevo.id_doctor, nuevo.id_consultorio, nuevo.id_recepcionista ?? null, nuevo.fecha, nuevo.hora_inicio, nuevo.hora_fin, 'Programada', nuevo.motivo_consulta, nuevo.costo_total, nuevo.registrado_por]
        );

        const id_cita = result.insertId;
        const montoAnticipo = nuevo.costo_total * 0.5;

        // Si paga con saldo, descuenta del saldo del paciente
        if (nuevo.metodo_pago === 'Saldo') {
            const [paciente]: any = await conexion.query(
                'SELECT saldo_pendiente FROM paciente WHERE id_paciente = ? LIMIT 1',
                [nuevo.id_paciente]
            )
            if (paciente[0].saldo_pendiente < montoAnticipo) {
                return { error: 'Saldo insuficiente para cubrir el anticipo' }
            }
            await conexion.query(
                'UPDATE paciente SET saldo_pendiente = saldo_pendiente - ? WHERE id_paciente = ?',
                [montoAnticipo, nuevo.id_paciente]
            )
        }

        // Notificacion al paciente
        await notificacionServices.creaNotificacion({
            id_usuario: (await conexion.query('SELECT id_usuario FROM paciente WHERE id_paciente = ?', [nuevo.id_paciente]) as any)[0][0].id_usuario,
            titulo: 'Cita confirmada',
            mensaje: `Tu cita para el ${nuevo.fecha} a las ${nuevo.hora_inicio} ha sido confirmada`
        });

        // Registra el anticipo
        const [pago]: any = await conexion.query(
            'INSERT INTO pago(id_cita, metodo_pago, tipo_pago, monto, referencia, registrado_por, estado) values(?,?,?,?,?,?,?)',
            [id_cita, nuevo.metodo_pago, 'Anticipo', montoAnticipo, nuevo.referencia ?? null, nuevo.registrado_por, 'Completado']
        );

        // Notificación al doctor
        const [doctorInfo]: any = await conexion.query(
            `SELECT u.id_usuario, u.nombre, u.apellido_paterno,
                    c.fecha, c.hora_inicio
            FROM doctor d
            INNER JOIN usuario u ON d.id_usuario = u.id_usuario
            INNER JOIN cita c ON c.id_cita = ?
            WHERE d.id_doctor = c.id_doctor LIMIT 1`,
            [result.insertId]
        )
        if (doctorInfo.length > 0) {
            const d       = doctorInfo[0]
            const fechaStr = typeof d.fecha === 'string'
                ? d.fecha.split('T')[0]
                : d.fecha.toISOString().split('T')[0]
            await notificacionServices.creaNotificacion({
                id_usuario: d.id_usuario,
                titulo:     'Nueva cita agendada',
                mensaje:    `Tienes una nueva cita el ${fechaStr} a las ${String(d.hora_inicio).slice(0,5)}.`
            })
        }

        return {
            mensaje: 'Cita registrada y anticipo pagado correctamente',
            id_cita,
            id_pago: pago.insertId,
            monto_anticipo: montoAnticipo,
            monto_pendiente: montoAnticipo
        };

    } catch(err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede registrar la cita" }
    }
}

export const editaCita = async (datos: Cita) => {
    try {

        
        const validacion = editarCitaSchema.safeParse(datos);
        if (!validacion.success) {
            return { error: validacion.error };
        }

        const [existe]: any = await conexion.query(
            'SELECT id_cita FROM cita WHERE id_cita = ? LIMIT 1',
            [datos.id_cita]
        );

        if (existe.length === 0) {
            return { error: 'No se encuentra la cita' };
        }

        await conexion.query(
            `UPDATE cita SET
                fecha = ?,
                hora_inicio = ?,
                hora_fin = ?,
                motivo_consulta = ?,
                costo_total = ?
            WHERE id_cita = ?`,
            [datos.fecha, datos.hora_inicio, datos.hora_fin, datos.motivo_consulta, datos.costo_total, datos.id_cita]
        );

        return { mensaje: 'Cita actualizada correctamente' };

    } catch(err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede editar la cita" }
    }
}

export const cancelaCita = async (id_cita: number, motivo: string, cancelado_por: number) => {
    try {
        const [existe]: any = await conexion.query(
            'SELECT id_cita, estado, fecha, hora_inicio FROM cita WHERE id_cita = ? LIMIT 1',
            [id_cita]
        );

        if (existe.length === 0) {
            return { error: 'No se encuentra la cita' };
        }

        if (existe[0].estado === 'Cancelada') {
            return { error: 'La cita ya fue cancelada' };
        }

        const fechaStr = typeof existe[0].fecha === 'string' 
            ? existe[0].fecha.split('T')[0] 
            : existe[0].fecha.toISOString().split('T')[0]
        const fechaHoraCita = new Date(`${fechaStr}T${existe[0].hora_inicio}`)
        const ahora = new Date();
        const diferenciaHoras = (fechaHoraCita.getTime() - ahora.getTime()) / (1000 * 60 * 60);

        const aplicaReembolso = diferenciaHoras >= 24 ? 1 : 0;

        await conexion.query(
            'UPDATE cita SET estado = ? WHERE id_cita = ?',
            ['Cancelada', id_cita]
        );

        await conexion.query(
            'INSERT INTO cancelacion(id_cita, cancelado_por, motivo, aplica_reembolso, porcentaje_reembolso) values(?,?,?,?,?)',
            [id_cita, cancelado_por, motivo, aplicaReembolso, aplicaReembolso ? 100.00 : 0.00]
        );

        // Notificacion al paciente
        const [pacienteCita]: any = await conexion.query(
            'SELECT p.id_usuario FROM paciente p INNER JOIN cita c ON p.id_paciente = c.id_paciente WHERE c.id_cita = ?',
            [id_cita]
        );
        await notificacionServices.creaNotificacion({
            id_usuario: pacienteCita[0].id_usuario,
            titulo: 'Cita cancelada',
            mensaje: aplicaReembolso
                ? `Tu cita ha sido cancelada. Motivo: ${motivo}. Se procesará el reembolso del 100% de tu anticipo.`
                : `Tu cita ha sido cancelada. Motivo: ${motivo}. No aplica reembolso por cancelación con menos de 24 horas.`
        });

        // Si aplica reembolso, suma el anticipo al saldo del paciente
        if (aplicaReembolso) {
            const [anticipo]: any = await conexion.query(
                "SELECT monto FROM pago WHERE id_cita = ? AND tipo_pago = 'Anticipo' AND estado = 'Completado' LIMIT 1",
                [id_cita]
            )
            if (anticipo.length > 0) {
                const [pacienteInfo]: any = await conexion.query(
                    'SELECT id_paciente FROM cita WHERE id_cita = ? LIMIT 1',
                    [id_cita]
                )
                if (pacienteInfo.length > 0) {
                    await conexion.query(
                        'UPDATE paciente SET saldo_pendiente = saldo_pendiente + ? WHERE id_paciente = ?',
                        [anticipo[0].monto, pacienteInfo[0].id_paciente]
                    )
                }
            }
        }

        // Notificación al doctor
        const [doctorCita]: any = await conexion.query(
            `SELECT u.id_usuario FROM doctor d
            INNER JOIN usuario u ON d.id_usuario = u.id_usuario
            INNER JOIN cita c ON c.id_doctor = d.id_doctor
            WHERE c.id_cita = ? LIMIT 1`,
            [id_cita]
        )
        if (doctorCita.length > 0) {
            const fechaStr = typeof existe[0].fecha === 'string'
                ? existe[0].fecha.split('T')[0]
                : existe[0].fecha.toISOString().split('T')[0]
            await notificacionServices.creaNotificacion({
                id_usuario: doctorCita[0].id_usuario,
                titulo:     'Cita cancelada por el paciente',
                mensaje:    `Una cita del ${fechaStr} a las ${String(existe[0].hora_inicio).slice(0,5)} ha sido cancelada por el paciente. Motivo: ${motivo}.`
            })
        }   

        return {
            mensaje: 'Cita cancelada correctamente',
            aplica_reembolso: aplicaReembolso === 1,
            mensaje_reembolso: aplicaReembolso === 1
                ? 'Se devolverá el 100% del anticipo pagado'
                : 'No aplica reembolso por cancelación con menos de 24 horas de anticipación'
        };

    } catch(err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede cancelar la cita" }
    }
}

export const cancelaCitaDoctor = async (id_cita: number, motivo: string, cancelado_por: number) => {
    try {
        const [existe]: any = await conexion.query(
            'SELECT id_cita, estado FROM cita WHERE id_cita = ? LIMIT 1',
            [id_cita]
        );

        if (existe.length === 0) {
            return { error: 'No se encuentra la cita' };
        }

        if (existe[0].estado === 'Cancelada') {
            return { error: 'La cita ya fue cancelada' };
        }

        await conexion.query(
            'UPDATE cita SET estado = ? WHERE id_cita = ?',
            ['Cancelada', id_cita]
        );

        await conexion.query(
            'INSERT INTO cancelacion(id_cita, cancelado_por, motivo, aplica_reembolso, porcentaje_reembolso) values(?,?,?,?,?)',
            [id_cita, cancelado_por, motivo, 1, 100.00]
        );

        // Doctor siempre aplica reembolso — suma anticipo al saldo del paciente
        const [anticipo]: any = await conexion.query(
            "SELECT monto FROM pago WHERE id_cita = ? AND tipo_pago = 'Anticipo' AND estado = 'Completado' LIMIT 1",
            [id_cita]
        )

        // Notificacion al paciente
        const [pacienteCita]: any = await conexion.query(
            `SELECT p.id_usuario, u.nombre, u.apellido_paterno,
                c.fecha, c.hora_inicio
            FROM paciente p
            INNER JOIN cita c ON p.id_paciente = c.id_paciente
            INNER JOIN usuario u ON p.id_usuario = u.id_usuario
            WHERE c.id_cita = ? LIMIT 1`,
            [id_cita]
        )
        if (pacienteCita.length > 0) {
            const p       = pacienteCita[0]
            const fechaStr = typeof p.fecha === 'string'
                ? p.fecha.split('T')[0]
                : p.fecha.toISOString().split('T')[0]
            await notificacionServices.creaNotificacion({
                id_usuario: p.id_usuario,
                titulo:     'Tu cita fue cancelada por el doctor',
                mensaje:    `Tu cita del ${fechaStr} a las ${String(p.hora_inicio).slice(0,5)} ha sido cancelada por el médico. Motivo: ${motivo}. Se devolverá el 100% de tu anticipo a tu saldo.`
            });
        }

        if (anticipo.length > 0) {
            const [pacienteInfo]: any = await conexion.query(
                'SELECT id_paciente FROM cita WHERE id_cita = ? LIMIT 1',
                [id_cita]
            )
            if (pacienteInfo.length > 0) {
                await conexion.query(
                    'UPDATE paciente SET saldo_pendiente = saldo_pendiente + ? WHERE id_paciente = ?',
                    [anticipo[0].monto, pacienteInfo[0].id_paciente]
                )
            }
        }

        

        return {
            mensaje: 'Cita cancelada correctamente',
            aplica_reembolso: true,
            mensaje_reembolso: 'Se devolverá el 100% del anticipo pagado'
        };

    } catch(err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede cancelar la cita" }
    }
}

export const marcaCitaAtendida = async (id_cita: number, id_doctor: number) => {
    try {
        const [existe]: any = await conexion.query(
            'SELECT id_cita, estado, id_doctor FROM cita WHERE id_cita = ? LIMIT 1',
            [id_cita]
        );

        if (existe.length === 0) {
            return { error: 'No se encuentra la cita' };
        }

        if (existe[0].id_doctor !== id_doctor) {
            return { error: 'No tienes permisos para marcar esta cita' };
        }

        if (existe[0].estado === 'Cancelada') {
            return { error: 'No se puede marcar como atendida una cita cancelada' };
        }

        if (existe[0].estado === 'Atendida') {
            return { error: 'La cita ya fue marcada como atendida' };
        }

        await conexion.query(
            "UPDATE cita SET estado = 'Atendida' WHERE id_cita = ?",
            [id_cita]
        );

        return { mensaje: 'Cita marcada como atendida correctamente' };

    } catch(err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede marcar la cita como atendida" }
    }
}

export const actualizaEstadoCita = async (id_cita: number, estado: string, id_doctor: number) => {
    try {
        const validacion = actualizarEstadoCitaSchema.safeParse({ id_cita, estado })
                if (!validacion.success) {
                    return { error: 'Estado no válido' }
        }

        const [existe]: any = await conexion.query(
            'SELECT id_cita, estado, id_doctor FROM cita WHERE id_cita = ? LIMIT 1',
            [id_cita]
        )
        if (existe.length === 0) return { error: 'No se encuentra la cita' }
        if (existe[0].id_doctor !== id_doctor) return { error: 'No tienes permisos para modificar esta cita' }
        if (existe[0].estado === 'Cancelada') return { error: 'No se puede modificar una cita cancelada' }

        await conexion.query('UPDATE cita SET estado = ? WHERE id_cita = ?', [estado, id_cita])
        return { mensaje: 'Estado actualizado correctamente' }
    } catch(err) {
        console.log('ERROR EN BD:', err)
        return { error: 'No se pudo actualizar el estado' }
    }
}