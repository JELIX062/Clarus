import conexion from '../database/conexion.js';

export const obtieneRoles = async () => {
    try {
        const [results] = await conexion.query('SELECT * FROM rol');
        return results;
    } catch(err) {
        return { error: "No se puede obtener los roles" }
    }
}

export const obtieneRol = async (id_rol: number) => {
    try {
        const [results] = await conexion.query('SELECT * FROM rol WHERE id_rol = ? LIMIT 1', [id_rol]);
        return results;
    } catch {
        return { error: "No se encuentra el rol" }
    }
}