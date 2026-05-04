import conexion from '../database/conexion.js';
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
    }
    catch (err) {
        return { error: "No se puede obtener las citas" };
    }
};
export const obtieneCita = async (id_cita) => {
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
    }
    catch {
        return { error: "No se encuentra la cita" };
    }
};
export const obtieneCitasPorPaciente = async (id_paciente) => {
    try {
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
    }
    catch {
        return { error: "No se encuentran las citas del paciente" };
    }
};
export const obtieneCitasPorDoctor = async (id_doctor) => {
    try {
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
    }
    catch {
        return { error: "No se encuentran las citas del doctor" };
    }
};
export const registraCita = async (nuevo) => {
    try {
        const diaSemana = new Date(nuevo.fecha).getDay();
        const [horario] = await conexion.query(`SELECT id_horario FROM horariodoctor 
            WHERE id_doctor = ? AND dia_semana = ? AND activo = 1
            AND hora_inicio <= ? AND hora_fin >= ?`, [nuevo.id_doctor, diaSemana, nuevo.hora_inicio, nuevo.hora_fin]);
        if (horario.length === 0) {
            return { error: 'El doctor no tiene horario disponible en ese dia y hora' };
        }
        const [bloqueo] = await conexion.query(`SELECT id_bloqueo FROM bloqueohorario
            WHERE id_doctor = ? AND fecha = ?
            AND hora_inicio < ? AND hora_fin > ?`, [nuevo.id_doctor, nuevo.fecha, nuevo.hora_fin, nuevo.hora_inicio]);
        if (bloqueo.length > 0) {
            return { error: 'El doctor tiene un bloqueo en ese horario' };
        }
        const [citaExistente] = await conexion.query(`SELECT id_cita FROM cita
            WHERE id_doctor = ? AND fecha = ? AND estado != 'Cancelada'
            AND hora_inicio < ? AND hora_fin > ?`, [nuevo.id_doctor, nuevo.fecha, nuevo.hora_fin, nuevo.hora_inicio]);
        if (citaExistente.length > 0) {
            return { error: 'El doctor ya tiene una cita en ese horario' };
        }
        // Registra la cita
        const [result] = await conexion.query(`INSERT INTO cita(id_paciente, id_doctor, id_consultorio, id_recepcionista, fecha, hora_inicio, hora_fin, estado, motivo_consulta, costo_total, registrado_por)
            values(?,?,?,?,?,?,?,?,?,?,?)`, [nuevo.id_paciente, nuevo.id_doctor, nuevo.id_consultorio, nuevo.id_recepcionista ?? null, nuevo.fecha, nuevo.hora_inicio, nuevo.hora_fin, 'Programada', nuevo.motivo_consulta, nuevo.costo_total, nuevo.registrado_por]);
        const id_cita = result.insertId;
        const montoAnticipo = nuevo.costo_total * 0.5;
        // Registra el anticipo
        const [pago] = await conexion.query('INSERT INTO pago(id_cita, metodo_pago, tipo_pago, monto, referencia, registrado_por, estado) values(?,?,?,?,?,?,?)', [id_cita, nuevo.metodo_pago, 'Anticipo', montoAnticipo, nuevo.referencia ?? null, nuevo.registrado_por, 'Completado']);
        return {
            mensaje: 'Cita registrada y anticipo pagado correctamente',
            id_cita,
            id_pago: pago.insertId,
            monto_anticipo: montoAnticipo,
            monto_pendiente: montoAnticipo
        };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede registrar la cita" };
    }
};
export const editaCita = async (datos) => {
    try {
        const [existe] = await conexion.query('SELECT id_cita FROM cita WHERE id_cita = ? LIMIT 1', [datos.id_cita]);
        if (existe.length === 0) {
            return { error: 'No se encuentra la cita' };
        }
        await conexion.query(`UPDATE cita SET
                fecha = ?,
                hora_inicio = ?,
                hora_fin = ?,
                motivo_consulta = ?,
                costo_total = ?
            WHERE id_cita = ?`, [datos.fecha, datos.hora_inicio, datos.hora_fin, datos.motivo_consulta, datos.costo_total, datos.id_cita]);
        return { mensaje: 'Cita actualizada correctamente' };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede editar la cita" };
    }
};
export const cancelaCita = async (id_cita, motivo, cancelado_por) => {
    try {
        const [existe] = await conexion.query('SELECT id_cita, estado, fecha, hora_inicio FROM cita WHERE id_cita = ? LIMIT 1', [id_cita]);
        if (existe.length === 0) {
            return { error: 'No se encuentra la cita' };
        }
        if (existe[0].estado === 'Cancelada') {
            return { error: 'La cita ya fue cancelada' };
        }
        const fechaHoraCita = new Date(`${existe[0].fecha}T${existe[0].hora_inicio}`);
        const ahora = new Date();
        const diferenciaHoras = (fechaHoraCita.getTime() - ahora.getTime()) / (1000 * 60 * 60);
        const aplicaReembolso = diferenciaHoras >= 24 ? 1 : 0;
        await conexion.query('UPDATE cita SET estado = ? WHERE id_cita = ?', ['Cancelada', id_cita]);
        await conexion.query('INSERT INTO cancelacion(id_cita, cancelado_por, motivo, aplica_reembolso, porcentaje_reembolso) values(?,?,?,?,?)', [id_cita, cancelado_por, motivo, aplicaReembolso, aplicaReembolso ? 100.00 : 0.00]);
        return {
            mensaje: 'Cita cancelada correctamente',
            aplica_reembolso: aplicaReembolso === 1,
            mensaje_reembolso: aplicaReembolso === 1
                ? 'Se devolverá el 100% del anticipo pagado'
                : 'No aplica reembolso por cancelación con menos de 24 horas de anticipación'
        };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede cancelar la cita" };
    }
};
export const cancelaCitaDoctor = async (id_cita, motivo, cancelado_por) => {
    try {
        const [existe] = await conexion.query('SELECT id_cita, estado FROM cita WHERE id_cita = ? LIMIT 1', [id_cita]);
        if (existe.length === 0) {
            return { error: 'No se encuentra la cita' };
        }
        if (existe[0].estado === 'Cancelada') {
            return { error: 'La cita ya fue cancelada' };
        }
        await conexion.query('UPDATE cita SET estado = ? WHERE id_cita = ?', ['Cancelada', id_cita]);
        await conexion.query('INSERT INTO cancelacion(id_cita, cancelado_por, motivo, aplica_reembolso, porcentaje_reembolso) values(?,?,?,?,?)', [id_cita, cancelado_por, motivo, 1, 100.00]);
        return {
            mensaje: 'Cita cancelada correctamente',
            aplica_reembolso: true,
            mensaje_reembolso: 'Se devolverá el 100% del anticipo pagado'
        };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede cancelar la cita" };
    }
};
export const marcaCitaAtendida = async (id_cita, id_doctor) => {
    try {
        const [existe] = await conexion.query('SELECT id_cita, estado, id_doctor FROM cita WHERE id_cita = ? LIMIT 1', [id_cita]);
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
        await conexion.query("UPDATE cita SET estado = 'Atendida' WHERE id_cita = ?", [id_cita]);
        return { mensaje: 'Cita marcada como atendida correctamente' };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede marcar la cita como atendida" };
    }
};
