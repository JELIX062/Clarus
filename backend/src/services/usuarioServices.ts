import conexion from '../database/conexion.js';

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

