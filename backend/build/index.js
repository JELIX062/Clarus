import express from 'express';
import usuarioRutas from './routes/usuarioRutas.js';
import pacienteRutas from './routes/pacienteRutas.js';
// Creamos la aplicacion a través del paquete express
// Y la llamamos a su constructor
const app = express();
// configurar rutas para el acceso a usuarios
app.use(express.json());
// activar rutas base
app.use('/api/usuario', usuarioRutas);
app.use('/api/paciente', pacienteRutas);
// Puerto para escuchar la peticion del frontend
const PUERTO = 3001;
// encendemos el servidor y lo ponemos en escucha
app.listen(PUERTO, () => {
    console.log(`Servidor en ejecucion y escuchando en el puerto ${PUERTO}`);
});
