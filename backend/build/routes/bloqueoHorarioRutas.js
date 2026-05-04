import express from 'express';
import * as bloqueoHorarioServices from '../services/bloqueoHorarioServices.js';
const router = express.Router();
// http://localhost:3001/api/bloqueo
router.get('/', async (_req, res) => {
    const bloqueos = await bloqueoHorarioServices.obtieneBloqueos();
    res.send(bloqueos);
});
// http://localhost:3001/api/bloqueo/doctor/1
router.get('/doctor/:id_doctor', async (req, res) => {
    const bloqueos = await bloqueoHorarioServices.obtieneBloqueosPorDoctor(Number(req.params.id_doctor));
    res.send(bloqueos);
});
// http://localhost:3001/api/bloqueo
router.post('/', async (req, res) => {
    try {
        const { id_doctor, fecha, hora_inicio, hora_fin, motivo, creado_por } = req.body;
        const resultado = await bloqueoHorarioServices.registraBloqueo({
            id_doctor,
            fecha,
            hora_inicio,
            hora_fin,
            motivo,
            creado_por
        });
        res.send(resultado);
    }
    catch (e) {
        res.status(400).send('No se puede registrar el bloqueo');
    }
});
// http://localhost:3001/api/bloqueo
router.delete('/', async (req, res) => {
    try {
        const { id_bloqueo } = req.body;
        const eliminado = await bloqueoHorarioServices.borrarBloqueo(Number(id_bloqueo));
        res.send(eliminado);
    }
    catch (e) {
        res.status(400).send('Error en los datos');
    }
});
export default router;
