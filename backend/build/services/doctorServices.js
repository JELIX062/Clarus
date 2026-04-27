import conexion from '../database/conexion.js';
export const obtieneDoctores = async () => {
    try {
        const [results] = await conexion.query(`
            SELECT d.*, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, u.telefono
            FROM doctor d
            INNER JOIN usuario u ON d.id_usuario = u.id_usuario
        `);
        return results;
    }
    catch (err) {
        return { error: "No se puede obtener los doctores" };
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
        return results;
    }
    catch {
        return { error: "No se encuentra el doctor" };
    }
};
export const agregaDoctor = async (nuevo) => {
    try {
        const [results] = await conexion.query('INSERT INTO doctor(id_usuario, id_sucursal, especialidad, rfc, cedula_profesional, tarifa_consulta) values(?,?,?,?,?,?)', [nuevo.id_usuario, nuevo.id_sucursal, nuevo.especialidad, nuevo.rfc, nuevo.cedula_profesional, nuevo.tarifa_consulta]);
        return results;
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: "No se puede agregar el doctor" };
    }
};
export const editaDoctor = async (id_doctor, datos) => {
    try {
        const [results] = await conexion.query('UPDATE doctor SET especialidad = ?, tarifa_consulta = ?, id_sucursal = ? WHERE id_doctor = ?', [datos.especialidad, datos.tarifa_consulta, datos.id_sucursal, id_doctor]);
        return results;
    }
    catch (err) {
        return { error: "No se puede editar el doctor" };
    }
};
export const desactivaDoctor = async (id_doctor) => {
    try {
        const [results] = await conexion.query('UPDATE usuario SET activo = 0 WHERE id_usuario = (SELECT id_usuario FROM doctor WHERE id_doctor = ?)', [id_doctor]);
        return results;
    }
    catch (err) {
        return { error: "No se puede desactivar el doctor" };
    }
};
