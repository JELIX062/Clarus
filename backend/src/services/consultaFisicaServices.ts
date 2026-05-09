import conexion from '../database/conexion.js';
import type { ConsultaFisica, ConsultaFisicaNuevo } from './typesUsuarios.js';
import { consultaFisicaSchema,editarConsultaFisicaSchema } from '../schemas/usuarioSchema.js';

export const obtieneConsultasFisicas = async () => {
    try {
        const [results] = await conexion.query(`
            SELECT cf.*,
                up.nombre as nombre_paciente, up.apellido_paterno as apellido_paciente,
                ud.nombre as nombre_doctor, ud.apellido_paterno as apellido_doctor
            FROM consultafisica cf
            INNER JOIN cita c ON cf.id_cita = c.id_cita
            INNER JOIN paciente p ON c.id_paciente = p.id_paciente
            INNER JOIN usuario up ON p.id_usuario = up.id_usuario
            INNER JOIN doctor d ON cf.id_doctor = d.id_doctor
            INNER JOIN usuario ud ON d.id_usuario = ud.id_usuario
        `);
        return results;
    } catch(err) {
        return { error: "No se puede obtener las consultas fisicas" }
    }
}

export const obtieneConsultaFisica = async (id_consulta: number) => {
    try {
        const [results] = await conexion.query(`
            SELECT cf.*,
                up.nombre as nombre_paciente, up.apellido_paterno as apellido_paciente,
                ud.nombre as nombre_doctor, ud.apellido_paterno as apellido_doctor
            FROM consultafisica cf
            INNER JOIN cita c ON cf.id_cita = c.id_cita
            INNER JOIN paciente p ON c.id_paciente = p.id_paciente
            INNER JOIN usuario up ON p.id_usuario = up.id_usuario
            INNER JOIN doctor d ON cf.id_doctor = d.id_doctor
            INNER JOIN usuario ud ON d.id_usuario = ud.id_usuario
            WHERE cf.id_consulta = ? LIMIT 1
        `, [id_consulta]);
        return results;
    } catch {
        return { error: "No se encuentra la consulta fisica" }
    }
}

export const obtieneConsultasFisicasPorExpediente = async (id_expediente: number) => {
    try {
        const [results] = await conexion.query(`
            SELECT cf.*,
                ud.nombre as nombre_doctor, ud.apellido_paterno as apellido_doctor
            FROM consultafisica cf
            INNER JOIN doctor d ON cf.id_doctor = d.id_doctor
            INNER JOIN usuario ud ON d.id_usuario = ud.id_usuario
            WHERE cf.id_expediente = ?
            ORDER BY cf.fecha_consulta DESC
        `, [id_expediente]);
        return results;
    } catch {
        return { error: "No se encuentran las consultas del expediente" }
    }
}

export const registraConsultaFisica = async (nuevo: ConsultaFisicaNuevo) => {
    try {


        const validacion = consultaFisicaSchema.safeParse(nuevo);
        if (!validacion.success) {
            return { error: validacion.error };
        }

        // Verifica que la cita exista y este en estado Atendida
        const [cita]: any = await conexion.query(
            'SELECT id_cita, estado FROM cita WHERE id_cita = ? LIMIT 1',
            [nuevo.id_cita]
        );

        if (cita.length === 0) {
            return { error: 'No se encuentra la cita' };
        }

        if (cita[0].estado !== 'Atendida') {
            return { error: 'La cita debe estar en estado Atendida para registrar la consulta' };
        }

        // Verifica que no tenga ya una consulta registrada
        const [consultaExiste]: any = await conexion.query(
            'SELECT id_consulta FROM consultafisica WHERE id_cita = ? LIMIT 1',
            [nuevo.id_cita]
        );

        if (consultaExiste.length > 0) {
            return { error: 'La cita ya tiene una consulta fisica registrada' };
        }

        const [result]: any = await conexion.query(
            `INSERT INTO consultafisica(
                id_cita, id_expediente, id_doctor, motivo_consulta,
                peso_kg, talla_cm, tension_arterial, temperatura_c, frecuencia_cardiaca,
                notas_examen_fisico, notas_clinicas, tratamiento, indicaciones, firmada
            ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                nuevo.id_cita, nuevo.id_expediente, nuevo.id_doctor, nuevo.motivo_consulta,
                nuevo.peso_kg, nuevo.talla_cm, nuevo.tension_arterial, nuevo.temperatura_c, nuevo.frecuencia_cardiaca,
                nuevo.notas_examen_fisico, nuevo.notas_clinicas, nuevo.tratamiento, nuevo.indicaciones, 0
            ]
        );

        return { mensaje: 'Consulta fisica registrada correctamente', id_consulta: result.insertId };

    } catch(err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede registrar la consulta fisica" }
    }
}

export const firmaConsultaFisica = async (id_consulta: number, id_doctor: number) => {
    try {
        const [existe]: any = await conexion.query(
            'SELECT id_consulta, firmada, id_doctor FROM consultafisica WHERE id_consulta = ? LIMIT 1',
            [id_consulta]
        );

        if (existe.length === 0) {
            return { error: 'No se encuentra la consulta fisica' };
        }

        if (existe[0].id_doctor !== id_doctor) {
            return { error: 'No tienes permisos para firmar esta consulta' };
        }

        if (existe[0].firmada === 1) {
            return { error: 'La consulta ya fue firmada' };
        }

        await conexion.query(
            'UPDATE consultafisica SET firmada = 1, fecha_firma = NOW() WHERE id_consulta = ?',
            [id_consulta]
        );

        return { mensaje: 'Consulta fisica firmada correctamente' };

    } catch(err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede firmar la consulta fisica" }
    }
}

export const editaConsultaFisica = async (datos: ConsultaFisica) => {
    try {
        const validacion = editarConsultaFisicaSchema.safeParse(datos);
        if (!validacion.success) {
            return { error: validacion.error };
        }

        const [existe]: any = await conexion.query(
            'SELECT id_consulta, firmada FROM consultafisica WHERE id_consulta = ? LIMIT 1',
            [datos.id_consulta]
        );

        if (existe.length === 0) {
            return { error: 'No se encuentra la consulta fisica' };
        }

        if (existe[0].firmada === 1) {
            return { error: 'No se puede editar una consulta ya firmada' };
        }

        await conexion.query(
            `UPDATE consultafisica SET
                motivo_consulta = ?,
                peso_kg = ?,
                talla_cm = ?,
                tension_arterial = ?,
                temperatura_c = ?,
                frecuencia_cardiaca = ?,
                notas_examen_fisico = ?,
                notas_clinicas = ?,
                tratamiento = ?,
                indicaciones = ?
            WHERE id_consulta = ?`,
            [
                datos.motivo_consulta, datos.peso_kg, datos.talla_cm,
                datos.tension_arterial, datos.temperatura_c, datos.frecuencia_cardiaca,
                datos.notas_examen_fisico, datos.notas_clinicas, datos.tratamiento,
                datos.indicaciones, datos.id_consulta
            ]
        );

        return { mensaje: 'Consulta fisica actualizada correctamente' };

    } catch(err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede editar la consulta fisica" }
    }
}