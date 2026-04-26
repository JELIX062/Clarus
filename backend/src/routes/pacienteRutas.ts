import express from 'express';
import type { Request, Response } from 'express';
import * as pacienteServices from '../services/pacienteServices.js';

const router = express.Router();

// http://localhost:3001/api/paciente
router.get('/', async (_req: Request, res: Response) => {
    const pacientes = await pacienteServices.obtienePacientes();
    res.send(pacientes);
});

// http://localhost:3001/api/paciente/1 + numero de id del paciente
router.get('/:id_paciente', async (req: Request, res: Response) => {
    const paciente = await pacienteServices.encuentraPaciente(Number(req.params.id_paciente));
    res.send(paciente);
});

// http://localhost:3001/api/paciente/1 + numero de id del paciente
router.put('/:id_paciente', async (req: Request, res: Response) => {
    const { fecha_nacimiento, sexo, tipo_sangre } = req.body;
    const resultado = await pacienteServices.editaPaciente(Number(req.params.id_paciente), { fecha_nacimiento, sexo, tipo_sangre });
    res.send(resultado);
});

export default router;