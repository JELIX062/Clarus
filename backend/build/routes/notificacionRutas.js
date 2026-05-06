import express from 'express';
import * as notificacionServices from '../services/notificacionServices.js';
const router = express.Router();
// http://localhost:3001/api/notificacion/1
router.get('/:id_usuario', async (req, res) => {
    const notificaciones = await notificacionServices.obtieneNotificaciones(Number(req.params.id_usuario));
    res.send(notificaciones);
});
// http://localhost:3001/api/notificacion/noleidas/1
router.get('/noleidas/:id_usuario', async (req, res) => {
    const notificaciones = await notificacionServices.obtieneNotificacionesNoLeidas(Number(req.params.id_usuario));
    res.send(notificaciones);
});
// http://localhost:3001/api/notificacion/leida
router.put('/leida', async (req, res) => {
    try {
        const { id_notificacion, id_usuario } = req.body;
        const resultado = await notificacionServices.marcaNotificacionLeida(Number(id_notificacion), Number(id_usuario));
        res.send(resultado);
    }
    catch (e) {
        res.status(400).send('Error en los datos');
    }
});
// http://localhost:3001/api/notificacion/leidastodas
router.put('/leidastodas', async (req, res) => {
    try {
        const { id_usuario } = req.body;
        const resultado = await notificacionServices.marcaTodasLeidas(Number(id_usuario));
        res.send(resultado);
    }
    catch (e) {
        res.status(400).send('Error en los datos');
    }
});
// http://localhost:3001/api/notificacion
router.delete('/', async (req, res) => {
    try {
        const { id_notificacion, id_usuario } = req.body;
        const eliminado = await notificacionServices.borraNotificacion(Number(id_notificacion), Number(id_usuario));
        res.send(eliminado);
    }
    catch (e) {
        res.status(400).send('Error en los datos');
    }
});
export default router;
