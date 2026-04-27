import conexion from '../database/conexion.js';
export const obtienePacientes = async () => {
    try {
        const [results] = await conexion.query('SELECT * FROM paciente');
        return results;
    }
    catch (err) {
        return { error: "No se puede obtener los pacientes" };
    }
};
export const encuentraPaciente = async (id_paciente) => {
    try {
        const [results] = await conexion.query('SELECT * FROM paciente WHERE id_paciente = ? LIMIT 1', [id_paciente]);
        return results;
    }
    catch {
        return { error: "No se encuentra el paciente" };
    }
};
export const editaPaciente = async (datos) => {
    try {
        // Verifica que el paciente exista
        const [existe] = await conexion.query('SELECT id_paciente FROM paciente WHERE id_paciente = ? LIMIT 1', [datos.id_paciente]);
        if (existe.length === 0) {
            return { error: 'No se encuentra el paciente' };
        }
        await conexion.query(`UPDATE usuario SET 
                nombre = ?,
                apellido_paterno = ?,
                apellido_materno = ?,
                correo = ?,
                telefono = ?
            WHERE id_usuario = (SELECT id_usuario FROM paciente WHERE id_paciente = ?)`, [datos.nombre, datos.apellido_paterno, datos.apellido_materno, datos.correo, datos.telefono, datos.id_paciente]);
        await conexion.query(`UPDATE paciente SET
                fecha_nacimiento = ?,
                sexo = ?,
                tipo_sangre = ?
            WHERE id_paciente = ?`, [datos.fecha_nacimiento, datos.sexo, datos.tipo_sangre, datos.id_paciente]);
        return { mensaje: 'Paciente actualizado correctamente' };
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede editar el paciente" };
    }
};
