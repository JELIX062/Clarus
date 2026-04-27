import express from 'express';
import * as doctorServices from '../services/doctorServices.js';
const router = express.Router();
// http://localhost:3001/api/doctor
router.get('/', async (_req, res) => {
    const doctores = await doctorServices.obtieneDoctores();
    res.send(doctores);
});
// http://localhost:3001/api/doctor/1 + numero de id del doctor
router.get('/:id_doctor', async (req, res) => {
    const doctor = await doctorServices.obtieneDoctor(Number(req.params.id_doctor));
    res.send(doctor);
});
// http://localhost:3001/api/doctor
router.post('/', async (req, res) => {
    try {
        const { id_usuario, id_sucursal, especialidad, rfc, cedula_profesional, tarifa_consulta } = req.body;
        const resultado = await doctorServices.agregaDoctor({ id_usuario, id_sucursal, especialidad, rfc, cedula_profesional, tarifa_consulta });
        res.send(resultado);
    }
    catch (e) {
        console.log("ERROR:", e);
        res.send('No se puede agregar el doctor');
    }
});
// http://localhost:3001/api/doctor/1 + numero de id del doctor
router.put('/:id_doctor', async (req, res) => {
    const { especialidad, tarifa_consulta, id_sucursal } = req.body;
    const resultado = await doctorServices.editaDoctor(Number(req.params.id_doctor), { especialidad, tarifa_consulta, id_sucursal });
    res.send(resultado);
});
// http://localhost:3001/api/doctor/desactivar/1 + numero de id del doctor
router.put('/desactivar/:id_doctor', async (req, res) => {
    const resultado = await doctorServices.desactivaDoctor(Number(req.params.id_doctor));
    res.send(resultado);
});
export default router;
