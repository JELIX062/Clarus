import express from 'express';
import type { Request, Response } from 'express';
import * as recepcionistaServices from '../services/recepcionistaServices.js';

const router = express.Router();

// http://localhost:3001/api/recepcionista
router.get('/', async (_req: Request, res: Response) => {
    const recepcionistas = await recepcionistaServices.obtieneRecepcionistas();
    res.send(recepcionistas);
});

// http://localhost:3001/api/recepcionista/1
router.get('/:id_recepcionista', async (req: Request, res: Response) => {
    const recepcionista = await recepcionistaServices.obtieneRecepcionista(Number(req.params.id_recepcionista));
    res.send(recepcionista);
});

// http://localhost:3001/api/recepcionista/
router.post('/', async (req: Request, res: Response) => {
    try {
        const { nombre, apellido_paterno, apellido_materno, correo, telefono, contraseña, id_sucursal, turno } = req.body;
        const resultado = await recepcionistaServices.registraRecepcionista({
            nombre,
            apellido_paterno,
            apellido_materno,
            correo,
            telefono,
            contraseña,
            id_sucursal,
            turno,
            id_usuario: 0
        });
        res.send(resultado);
    } catch(e) {
        res.status(400).send('No se puede registrar la recepcionista');
    }
});

// http://localhost:3001/api/recepcionista
router.put('/', async (req: Request, res: Response) => {
    try {
        const { id_recepcionista, id_usuario, nombre, apellido_paterno, apellido_materno, correo, telefono, contraseña, id_sucursal, turno } = req.body;
        const modificado = await recepcionistaServices.editaRecepcionista({
            id_recepcionista,
            id_usuario,
            nombre,
            apellido_paterno,
            apellido_materno,
            correo,
            telefono,
            contraseña,
            id_sucursal,
            turno
        });
        res.send(modificado);
    } catch(e) {
        res.status(400).send('Error en los datos');
    }
});

// http://localhost:3001/api/recepcionista
router.delete('/', async (req: Request, res: Response) => {
    try {
        const { id_recepcionista } = req.body;
        const eliminado = await recepcionistaServices.borrarRecepcionista(Number(id_recepcionista));
        res.send(eliminado);
    } catch(e) {
        res.status(400).send('Error en los datos');
    }
});

export default router;