import mysql from 'mysql2/promise';
const conexion = mysql.createPool({
    host: 'localhost',
    user: 'Equipo14',
    password: 'Equipo14',
    database: 'clarus'
});
export default conexion;
