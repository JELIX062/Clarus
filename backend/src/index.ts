import express from 'express';
//Creamos la aplicacion a través del paquete express
//Y la llamamos a su constructor
const app = express();
//configurar rutas para el acceso a usuarios
import usuarioRutas from './routes/usuarioRutas.js';
//Todo lo que regresa 
app.use(express.json());
//Puerto para escuchar la peticion del frontend
const PUERTO = 3001;
//activar rutas base
app.use('/api/usuario', usuarioRutas);
//Ruta

//encendemos el servidor y lo ponemos en escucha
app.listen(PUERTO, () => {
    console.log(`Servidor en ejecucion y escuchando en el puerto ${PUERTO}`);
})