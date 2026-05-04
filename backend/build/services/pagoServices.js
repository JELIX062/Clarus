import conexion from '../database/conexion.js';
export const obtienePagos = async () => {
    try {
        const [results] = await conexion.query(`
            SELECT pg.*,
                up.nombre as nombre_paciente, up.apellido_paterno as apellido_paciente,
                ud.nombre as nombre_doctor, ud.apellido_paterno as apellido_doctor,
                c.fecha as fecha_cita, c.hora_inicio, c.costo_total
            FROM pago pg
            INNER JOIN cita c ON pg.id_cita = c.id_cita
            INNER JOIN paciente p ON c.id_paciente = p.id_paciente
            INNER JOIN usuario up ON p.id_usuario = up.id_usuario
            INNER JOIN doctor d ON c.id_doctor = d.id_doctor
            INNER JOIN usuario ud ON d.id_usuario = ud.id_usuario
        `);
        return results;
    }
    catch (err) {
        return { error: "No se puede obtener los pagos" };
    }
};
export const obtienePago = async (id_pago) => {
    try {
        const [results] = await conexion.query(`
            SELECT pg.*,
                up.nombre as nombre_paciente, up.apellido_paterno as apellido_paciente,
                ud.nombre as nombre_doctor, ud.apellido_paterno as apellido_doctor,
                c.fecha as fecha_cita, c.hora_inicio, c.costo_total
            FROM pago pg
            INNER JOIN cita c ON pg.id_cita = c.id_cita
            INNER JOIN paciente p ON c.id_paciente = p.id_paciente
            INNER JOIN usuario up ON p.id_usuario = up.id_usuario
            INNER JOIN doctor d ON c.id_doctor = d.id_doctor
            INNER JOIN usuario ud ON d.id_usuario = ud.id_usuario
            WHERE pg.id_pago = ? LIMIT 1
        `, [id_pago]);
        return results;
    }
    catch {
        return { error: "No se encuentra el pago" };
    }
};
export const obtienePagosPorCita = async (id_cita) => {
    try {
        const [results] = await conexion.query(`
            SELECT pg.*
            FROM pago pg
            WHERE pg.id_cita = ?
        `, [id_cita]);
        return results;
    }
    catch {
        return { error: "No se encuentran los pagos de la cita" };
    }
};
export const registraPagoFinal = async (nuevo) => {
    try {
        const [cita] = await conexion.query('SELECT costo_total, estado FROM cita WHERE id_cita = ? LIMIT 1', [nuevo.id_cita]);
        if (cita.length === 0) {
            return { error: 'No se encuentra la cita' };
        }
        if (cita[0].estado === 'Cancelada') {
            return { error: 'No se puede registrar pago de una cita cancelada' };
        }
        if (cita[0].estado !== 'Atendida') {
            return { error: 'La cita aún no ha sido atendida' };
        }
        const [anticipo] = await conexion.query("SELECT monto FROM pago WHERE id_cita = ? AND tipo_pago = 'Anticipo' AND estado = 'Completado'", [nuevo.id_cita]);
        if (anticipo.length === 0) {
            return { error: 'La cita no tiene anticipo registrado' };
        }
        const [pagoFinal] = await conexion.query("SELECT id_pago FROM pago WHERE id_cita = ? AND tipo_pago = 'Total'", [nuevo.id_cita]);
        if (pagoFinal.length > 0) {
            return { error: 'La cita ya tiene el pago final registrado' };
        }
        const montoFinal = cita[0].costo_total - anticipo[0].monto;
        const [result] = await conexion.query('INSERT INTO pago(id_cita, metodo_pago, tipo_pago, monto, referencia, registrado_por, estado) values(?,?,?,?,?,?,?)', [nuevo.id_cita, nuevo.metodo_pago, 'Total', montoFinal, nuevo.referencia ?? null, nuevo.registrado_por, 'Completado']);
        // Marca la cita como Pagada
        await conexion.query("UPDATE cita SET estado = 'Pagada' WHERE id_cita = ?", [nuevo.id_cita]);
        return {
            mensaje: 'Pago final registrado correctamente',
            id_pago: result.insertId,
            monto: montoFinal,
            mensaje_estado: 'La cita ha sido marcada como Pagada'
        };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede registrar el pago final" };
    }
};
