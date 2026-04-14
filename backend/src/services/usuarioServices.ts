import mysql from 'mysql2/promise';

const conexion = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'clarus'
})

export const obtieneUsuario = async () => {
    try {
        const[results] = await conexion.query('SELECT * FROM usuario');
        return results;
    }catch(err){
        return {error: "No se puede obtener el usuario"}
    }
}
