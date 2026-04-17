import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
const conexion = mysql.createPool({
    host: 'localhost',
    user: 'Equipo14',
    password: 'Equipo14',
    database: 'clarus'
});
export const obtieneUsuario = async () => {
    try {
        const [results] = await conexion.query('SELECT * FROM usuario');
        return results;
    }
    catch (err) {
        return { error: "No se puede obtener el usuario" };
    }
};
export const encuentraUsuario = async (id_usuario) => {
    try {
        const [results] = await conexion.query('SELECT * FROM usuario WHERE id_usuario = ? LIMIT 1', [id_usuario]);
        return results;
    }
    catch {
        return { error: "No se encuentra el usuario" };
    }
};
export const agregaUsuario = async (nuevo) => {
    try {
        const hash = await bcrypt.hash(nuevo.contraseña, 10); // 👈 2. Hashea la contraseña
        const [results] = await conexion.query('INSERT INTO usuario(nombre,apellido_paterno,apellido_materno,correo,telefono,contrasena_hash) values(?,?,?,?,?,?)', [nuevo.nombre, nuevo.apellido_paterno, nuevo.apellido_materno ?? null, nuevo.correo, nuevo.telefono ?? null, hash] // 👈 3. Usa hash
        );
        return results;
    }
    catch (err) {
        console.log("ERROR EN BD:", err);
        return { error: 'No se puede agregar el usuario' };
    }
};
