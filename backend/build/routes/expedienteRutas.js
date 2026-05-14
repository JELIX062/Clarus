import express from 'express';
import * as expedienteServices from '../services/expedienteServices.js';
const router = express.Router();
// http://localhost:3001/api/expediente
router.get('/', async (_req, res) => {
    const expedientes = await expedienteServices.obtieneExpedientes();
    res.send(expedientes);
});
// http://localhost:3001/api/expediente/1
router.get('/:id_expediente', async (req, res) => {
    const expediente = await expedienteServices.obtieneExpediente(Number(req.params.id_expediente));
    res.send(expediente);
});
// http://localhost:3001/api/expediente/paciente/1
router.get('/paciente/:id_paciente', async (req, res) => {
    const expediente = await expedienteServices.obtieneExpedientePorPaciente(Number(req.params.id_paciente));
    res.send(expediente);
});
// http://localhost:3001/api/expediente/doctor/1
router.get('/doctor/:id_doctor', async (req, res) => {
    const expedientes = await expedienteServices.obtieneExpedientesPorDoctor(Number(req.params.id_doctor));
    res.send(expedientes);
});
// http://localhost:3001/api/expediente
router.post('/', async (req, res) => {
    try {
        const { id_paciente, id_doctor, ant_patologicos, medicamentos_actuales, alergias } = req.body;
        const resultado = await expedienteServices.registraExpediente({
            id_paciente,
            id_doctor,
            ant_patologicos,
            medicamentos_actuales,
            alergias
        });
        res.send(resultado);
    }
    catch (e) {
        res.status(400).send('No se puede registrar el expediente');
    }
});
// http://localhost:3001/api/expediente
router.put('/', async (req, res) => {
    try {
        const { id_expediente, id_paciente, ant_patologicos, medicamentos_actuales, alergias } = req.body;
        const modificado = await expedienteServices.editaExpediente({
            id_expediente,
            id_paciente,
            ant_patologicos,
            medicamentos_actuales,
            alergias
        });
        res.send(modificado);
    }
    catch (e) {
        res.status(400).send('Error en los datos');
    }
});
// http://localhost:3001/api/expediente
router.delete('/', async (req, res) => {
    try {
        const { id_expediente } = req.body;
        const eliminado = await expedienteServices.borrarExpediente(Number(id_expediente));
        res.send(eliminado);
    }
    catch (e) {
        res.status(400).send('Error en los datos');
    }
});
export default router;
