import express from 'express';
import type { Request, Response } from 'express';
import * as doctorServices from '../services/doctorServices.js';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
    const doctores = await doctorServices.obtieneDoctores();
    res.send(doctores);
});

router.get('/:id_doctor', async (req: Request, res: Response) => {
    const doctor = await doctorServices.obtieneDoctor(Number(req.params.id_doctor));
    res.send(doctor);
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const { nombre, apellido_paterno, apellido_materno, correo, telefono, contraseña,
                sucursales, especialidad, rfc, cedula_profesional, tarifa_consulta } = req.body;
        const resultado = await doctorServices.registraDoctor({
            nombre, 
            apellido_paterno, 
            apellido_materno, 
            correo, 
            telefono, 
            contraseña,
            sucursales, 
            especialidad, 
            rfc, 
            cedula_profesional, 
            tarifa_consulta,
            id_usuario: 0
        });
        res.send(resultado);
    } catch(e) {
        res.status(400).send('No se puede registrar el doctor');
    }
});

router.put('/', async (req: Request, res: Response) => {
    try {
        const { id_doctor, id_usuario, nombre, apellido_paterno, apellido_materno, correo,
                telefono, contraseña, especialidad, rfc, cedula_profesional, tarifa_consulta,
                sucursales } = req.body;
        const resultado = await doctorServices.editaDoctor({
            id_doctor, 
            id_usuario,
            nombre, 
            apellido_paterno, 
            apellido_materno, 
            correo,
            telefono, contraseña, 
            especialidad, 
            rfc, 
            cedula_profesional,
            tarifa_consulta,
            sucursales
        });
        res.send(resultado);
    } catch(e) {
        res.status(400).send('No se puede editar el doctor');
    }
});

router.delete('/', async (req: Request, res: Response) => {
    try {
        const { id_doctor } = req.body;
        const eliminado = await doctorServices.borrarDoctor(Number(id_doctor));
        res.send(eliminado);
    } catch(e) {
        res.status(400).send('Error en los datos');
    }
});

export default router;