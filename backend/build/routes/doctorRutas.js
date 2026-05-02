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
// http://localhost:3001/api/doctor/
router.post('/', async (req, res) => {
    try {
        const { nombre, apellido_paterno, apellido_materno, correo, telefono, contraseña, id_sucursal, especialidad, rfc, cedula_profesional, tarifa_consulta } = req.body;
        const resultado = await doctorServices.registraDoctor({
            nombre,
            apellido_paterno,
            apellido_materno,
            correo,
            telefono,
            contraseña,
            id_sucursal,
            especialidad,
            rfc,
            cedula_profesional,
            tarifa_consulta,
            id_usuario: 0
        });
        res.send(resultado);
    }
    catch (e) {
        res.status(400).send('No se puede registrar el doctor');
    }
});
// http://localhost:3001/api/doctor
router.put('/', async (req, res) => {
    try {
        const { id_doctor, id_usuario, nombre, apellido_paterno, apellido_materno, correo, telefono, contraseña, especialidad, rfc, cedula_profesional, tarifa_consulta, id_sucursal } = req.body;
        const resultado = await doctorServices.editaDoctor({
            id_doctor,
            id_usuario,
            nombre,
            apellido_paterno,
            apellido_materno,
            correo,
            telefono,
            contraseña,
            especialidad,
            rfc,
            cedula_profesional,
            tarifa_consulta,
            id_sucursal
        });
        res.send(resultado);
    }
    catch (e) {
        res.status(400).send('No se puede editar el doctor');
    }
});
// http://localhost:3001/api/doctor
router.delete('/', async (req, res) => {
    try {
        const { id_doctor } = req.body;
        const eliminado = await doctorServices.borrarDoctor(Number(id_doctor));
        res.send(eliminado);
    }
    catch (e) {
        res.status(400).send('Error en los datos');
    }
});
export default router;
