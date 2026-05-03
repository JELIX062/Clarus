import express from 'express';
import usuarioRutas from './routes/usuarioRutas.js';
import pacienteRutas from './routes/pacienteRutas.js';
import rolRutas from './routes/rolRutas.js';
import doctorRutas from './routes/doctorRutas.js';
import recepcionistaRutas from './routes/recepcionistaRutas.js';
import sucursalRutas from './routes/sucursalRutas.js';
import consultorioRutas from './routes/consultorioRutas.js';
import expedienteRutas from './routes/expedienteRutas.js';
import citaRutas from './routes/citaRutas.js';
// Creamos la aplicacion a través del paquete express
// Y la llamamos a su constructor
const app = express();
// configurar rutas para el acceso a usuarios
app.use(express.json());
// activar rutas base
app.use('/api/usuario', usuarioRutas);
app.use('/api/paciente', pacienteRutas);
app.use('/api/rol', rolRutas);
app.use('/api/doctor', doctorRutas);
app.use('/api/recepcionista', recepcionistaRutas);
app.use('/api/sucursal', sucursalRutas);
app.use('/api/consultorio', consultorioRutas);
app.use('/api/expediente', expedienteRutas);
app.use('/api/cita', citaRutas);
// Puerto para escuchar la peticion del frontend
const PUERTO = 3001;
// encendemos el servidor y lo ponemos en escucha
app.listen(PUERTO, () => {
    console.log(`Servidor en ejecucion y escuchando en el puerto ${PUERTO}`);
});
