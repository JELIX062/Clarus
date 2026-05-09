import express from 'express';
import * as citaServices from '../services/citaServices.js';
const router = express.Router();
// http://localhost:3001/api/cita
router.get('/', async (_req, res) => {
    const citas = await citaServices.obtieneCitas();
    res.send(citas);
});
// http://localhost:3001/api/cita/1
router.get('/:id_cita', async (req, res) => {
    const cita = await citaServices.obtieneCita(Number(req.params.id_cita));
    res.send(cita);
});
// http://localhost:3001/api/cita/paciente/1
router.get('/paciente/:id_paciente', async (req, res) => {
    const citas = await citaServices.obtieneCitasPorPaciente(Number(req.params.id_paciente));
    res.send(citas);
});
// http://localhost:3001/api/cita/doctor/1
router.get('/doctor/:id_doctor', async (req, res) => {
    const citas = await citaServices.obtieneCitasPorDoctor(Number(req.params.id_doctor));
    res.send(citas);
});
// http://localhost:3001/api/cita
router.post('/', async (req, res) => {
    try {
        const { id_paciente, id_doctor, id_consultorio, id_recepcionista, fecha, hora_inicio, hora_fin, motivo_consulta, costo_total, registrado_por, metodo_pago, referencia } = req.body;
        const resultado = await citaServices.registraCita({
            id_paciente,
            id_doctor,
            id_consultorio,
            id_recepcionista,
            fecha,
            hora_inicio,
            hora_fin,
            estado: 'Programada',
            motivo_consulta,
            costo_total,
            registrado_por,
            metodo_pago,
            referencia
        });
        res.send(resultado);
    }
    catch (e) {
        res.status(400).send('No se puede registrar la cita');
    }
});
// http://localhost:3001/api/cita
router.put('/', async (req, res) => {
    try {
        const { id_cita, id_paciente, id_doctor, id_consultorio, id_recepcionista, fecha, hora_inicio, hora_fin, estado, motivo_consulta, costo_total, registrado_por } = req.body;
        const modificado = await citaServices.editaCita({
            id_cita,
            id_paciente,
            id_doctor,
            id_consultorio,
            id_recepcionista,
            fecha,
            hora_inicio,
            hora_fin,
            estado,
            motivo_consulta,
            costo_total,
            registrado_por
        });
        res.send(modificado);
    }
    catch (e) {
        res.status(400).send('Error en los datos');
    }
});
// http://localhost:3001/api/cita/cancelar
router.put('/cancelar', async (req, res) => {
    try {
        const { id_cita, motivo, cancelado_por } = req.body;
        const resultado = await citaServices.cancelaCita(Number(id_cita), motivo, Number(cancelado_por));
        res.send(resultado);
    }
    catch (e) {
        res.status(400).send('Error en los datos');
    }
});
// http://localhost:3001/api/cita/atendida
router.put('/atendida', async (req, res) => {
    try {
        const { id_cita, id_doctor } = req.body;
        const resultado = await citaServices.marcaCitaAtendida(Number(id_cita), Number(id_doctor));
        res.send(resultado);
    }
    catch (e) {
        res.status(400).send('Error en los datos');
    }
});
export default router;
