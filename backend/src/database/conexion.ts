import mysql from 'mysql2/promise';

const conexion = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'clarus'
});

export default conexion;