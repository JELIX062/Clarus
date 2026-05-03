import conexion from '../database/conexion.js';
export const obtieneCitas = async () => {
    try {
        const [results] = await conexion.query(`
            SELECT c.*,
                up.nombre as nombre_paciente, up.apellido_paterno as apellido_paciente,
                ud.nombre as nombre_doctor, ud.apellido_paterno as apellido_doctor,
                co.numero as numero_consultorio, s.nombre as nombre_sucursal
            FROM cita c
            INNER JOIN paciente p ON c.id_paciente = p.id_paciente
            INNER JOIN usuario up ON p.id_usuario = up.id_usuario
            INNER JOIN doctor d ON c.id_doctor = d.id_doctor
            INNER JOIN usuario ud ON d.id_usuario = ud.id_usuario
            INNER JOIN consultorio co ON c.id_consultorio = co.id_consultorio
            INNER JOIN sucursal s ON co.id_sucursal = s.id_sucursal
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
                co.numero as numero_consultorio, s.nombre as nombre_sucursal
            FROM cita c
            INNER JOIN paciente p ON c.id_paciente = p.id_paciente
            INNER JOIN usuario up ON p.id_usuario = up.id_usuario
            INNER JOIN doctor d ON c.id_doctor = d.id_doctor
            INNER JOIN usuario ud ON d.id_usuario = ud.id_usuario
            INNER JOIN consultorio co ON c.id_consultorio = co.id_consultorio
            INNER JOIN sucursal s ON co.id_sucursal = s.id_sucursal
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
                co.numero as numero_consultorio, s.nombre as nombre_sucursal
            FROM cita c
            INNER JOIN doctor d ON c.id_doctor = d.id_doctor
            INNER JOIN usuario ud ON d.id_usuario = ud.id_usuario
            INNER JOIN consultorio co ON c.id_consultorio = co.id_consultorio
            INNER JOIN sucursal s ON co.id_sucursal = s.id_sucursal
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
                co.numero as numero_consultorio, s.nombre as nombre_sucursal
            FROM cita c
            INNER JOIN paciente p ON c.id_paciente = p.id_paciente
            INNER JOIN usuario up ON p.id_usuario = up.id_usuario
            INNER JOIN consultorio co ON c.id_consultorio = co.id_consultorio
            INNER JOIN sucursal s ON co.id_sucursal = s.id_sucursal
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
        const [result] = await conexion.query(`INSERT INTO cita(id_paciente, id_doctor, id_consultorio, id_recepcionista, fecha, hora_inicio, hora_fin, estado, motivo_consulta, costo_total, registrado_por)
            values(?,?,?,?,?,?,?,?,?,?,?)`, [nuevo.id_paciente, nuevo.id_doctor, nuevo.id_consultorio, nuevo.id_recepcionista ?? null, nuevo.fecha, nuevo.hora_inicio, nuevo.hora_fin, 'Programada', nuevo.motivo_consulta, nuevo.costo_total, nuevo.registrado_por]);
        return { mensaje: 'Cita registrada correctamente', id_cita: result.insertId };
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
        const [existe] = await conexion.query('SELECT id_cita, estado FROM cita WHERE id_cita = ? LIMIT 1', [id_cita]);
        if (existe.length === 0) {
            return { error: 'No se encuentra la cita' };
        }
        if (existe[0].estado === 'Cancelada') {
            return { error: 'La cita ya fue cancelada' };
        }
        await conexion.query('UPDATE cita SET estado = ? WHERE id_cita = ?', ['Cancelada', id_cita]);
        await conexion.query('INSERT INTO cancelacion(id_cita, cancelado_por, motivo, aplica_reembolso, porcentaje_reembolso) values(?,?,?,?,?)', [id_cita, cancelado_por, motivo, 1, 50.00]);
        return { mensaje: 'Cita cancelada correctamente' };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede cancelar la cita" };
    }
};
