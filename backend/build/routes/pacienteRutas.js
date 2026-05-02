import express from 'express';
import * as pacienteServices from '../services/pacienteServices.js';
const router = express.Router();
// http://localhost:3001/api/paciente
router.get('/', async (_req, res) => {
    const pacientes = await pacienteServices.obtienePacientes();
    res.send(pacientes);
});
// http://localhost:3001/api/paciente/1 + numero de id del paciente
router.get('/:id_paciente', async (req, res) => {
    const paciente = await pacienteServices.encuentraPaciente(Number(req.params.id_paciente));
    res.send(paciente);
});
router.post('/', async (req, res) => {
    try {
        const { nombre, apellido_paterno, apellido_materno, correo, telefono, contraseña, fecha_nacimiento, sexo, tipo_sangre } = req.body;
        const nuevoUsuario = await pacienteServices.agregaPaciente({
            nombre,
            apellido_paterno,
            apellido_materno,
            correo,
            telefono,
            contraseña,
            fecha_nacimiento,
            sexo,
            tipo_sangre
        });
        res.send(nuevoUsuario);
    }
    catch (e) {
        console.log("ERROR:", e);
        res.send('No se puede agregar el usuario');
    }
});
// http://localhost:3001/api/paciente
router.put('/', async (req, res) => {
    try {
        const { id_paciente, id_usuario, nombre, apellido_paterno, apellido_materno, correo, telefono, contraseña, fecha_nacimiento, sexo, tipo_sangre, saldo_pendiente } = req.body;
        const modificado = await pacienteServices.editaPaciente({
            id_paciente,
            id_usuario,
            nombre,
            apellido_paterno,
            apellido_materno,
            correo,
            telefono,
            contraseña,
            fecha_nacimiento,
            sexo,
            tipo_sangre,
            saldo_pendiente
        });
        res.send(modificado);
    }
    catch (e) {
        res.status(400).send("Error en los datos");
    }
});
// http://localhost:3001/api/paciente
router.delete('/', async (req, res) => {
    try {
        const { id_paciente } = req.body;
        const eliminado = await pacienteServices.borrarPaciente(Number(id_paciente));
        res.send(eliminado);
    }
    catch (e) {
        res.status(400).send('Error en los datos');
    }
});
export default router;
