import express from 'express';
import * as horarioDoctorServices from '../services/horarioDoctorServices.js';
const router = express.Router();
// http://localhost:3001/api/horario
router.get('/', async (_req, res) => {
    const horarios = await horarioDoctorServices.obtieneHorarios();
    res.send(horarios);
});
// http://localhost:3001/api/horario/doctor/1
router.get('/doctor/:id_doctor', async (req, res) => {
    const horarios = await horarioDoctorServices.obtieneHorariosPorDoctor(Number(req.params.id_doctor));
    res.send(horarios);
});
// http://localhost:3001/api/horario
router.post('/', async (req, res) => {
    try {
        const { id_doctor, id_consultorio, dia_semana, hora_inicio, hora_fin } = req.body;
        const resultado = await horarioDoctorServices.registraHorario({
            id_doctor,
            id_consultorio,
            dia_semana,
            hora_inicio,
            hora_fin,
            activo: 1
        });
        res.send(resultado);
    }
    catch (e) {
        res.status(400).send('No se puede registrar el horario');
    }
});
// http://localhost:3001/api/horario
router.put('/', async (req, res) => {
    try {
        const { id_horario, id_doctor, id_consultorio, dia_semana, hora_inicio, hora_fin, activo } = req.body;
        const modificado = await horarioDoctorServices.editaHorario({
            id_horario,
            id_doctor,
            id_consultorio,
            dia_semana,
            hora_inicio,
            hora_fin,
            activo
        });
        res.send(modificado);
    }
    catch (e) {
        res.status(400).send('Error en los datos');
    }
});
// http://localhost:3001/api/horario
router.delete('/', async (req, res) => {
    try {
        const { id_horario } = req.body;
        const eliminado = await horarioDoctorServices.borrarHorario(Number(id_horario));
        res.send(eliminado);
    }
    catch (e) {
        res.status(400).send('Error en los datos');
    }
});
export default router;
