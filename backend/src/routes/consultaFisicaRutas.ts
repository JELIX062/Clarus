import express from 'express';
import type { Request, Response } from 'express';
import * as consultaFisicaServices from '../services/consultaFisicaServices.js';

const router = express.Router();

// http://localhost:3001/api/consultafisica
router.get('/', async (_req: Request, res: Response) => {
    const consultas = await consultaFisicaServices.obtieneConsultasFisicas();
    res.send(consultas);
});

// http://localhost:3001/api/consultafisica/1
router.get('/:id_consulta', async (req: Request, res: Response) => {
    const consulta = await consultaFisicaServices.obtieneConsultaFisica(Number(req.params.id_consulta));
    res.send(consulta);
});

// GET /api/consultafisica/paciente/:id_paciente
router.get('/paciente/:id_paciente', async (req: Request, res: Response) => {
    const resultado = await consultaFisicaServices.obtieneConsultasPorPaciente(
        Number(req.params.id_paciente)
    )
    res.send(resultado)
})

// http://localhost:3001/api/consultafisica/expediente/1
router.get('/expediente/:id_expediente', async (req: Request, res: Response) => {
    const consultas = await consultaFisicaServices.obtieneConsultasFisicasPorExpediente(Number(req.params.id_expediente));
    res.send(consultas);
});

// http://localhost:3001/api/consultafisica
router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            id_cita, id_expediente, id_doctor, motivo_consulta,
            peso_kg, talla_cm, tension_arterial, temperatura_c, frecuencia_cardiaca,
            notas_examen_fisico, notas_clinicas, tratamiento, indicaciones
        } = req.body;
        const resultado = await consultaFisicaServices.registraConsultaFisica({
            id_cita,
            id_expediente,
            id_doctor,
            motivo_consulta,
            peso_kg,
            talla_cm,
            tension_arterial,
            temperatura_c,
            frecuencia_cardiaca,
            notas_examen_fisico,
            notas_clinicas,
            tratamiento,
            indicaciones,
            firmada: 0
        });
        res.send(resultado);
    } catch(e) {
        res.status(400).send('No se puede registrar la consulta fisica');
    }
});

// http://localhost:3001/api/consultafisica
router.put('/', async (req: Request, res: Response) => {
    try {
        const {
            id_consulta, id_cita, id_expediente, id_doctor, motivo_consulta,
            peso_kg, talla_cm, tension_arterial, temperatura_c, frecuencia_cardiaca,
            notas_examen_fisico, notas_clinicas, tratamiento, indicaciones, firmada
        } = req.body;
        const modificado = await consultaFisicaServices.editaConsultaFisica({
            id_consulta,
            id_cita,
            id_expediente,
            id_doctor,
            motivo_consulta,
            peso_kg,
            talla_cm,
            tension_arterial,
            temperatura_c,
            frecuencia_cardiaca,
            notas_examen_fisico,
            notas_clinicas,
            tratamiento,
            indicaciones,
            firmada
        });
        res.send(modificado);
    } catch(e) {
        res.status(400).send('Error en los datos');
    }
});

// http://localhost:3001/api/consultafisica/firmar
router.put('/firmar', async (req: Request, res: Response) => {
    try {
        const { id_consulta, id_doctor } = req.body;
        const resultado = await consultaFisicaServices.firmaConsultaFisica(Number(id_consulta), Number(id_doctor));
        res.send(resultado);
    } catch(e) {
        res.status(400).send('Error en los datos');
    }
});

export default router;