import express from 'express';
import type { Request, Response } from 'express';
import * as administradorServices from '../services/administradorServices.js';

const router = express.Router();

// http://localhost:3001/api/administrador
router.get('/', async (_req: Request, res: Response) => {
    const administradores = await administradorServices.obtieneAdministradores();
    res.send(administradores);
});

// http://localhost:3001/api/administrador/1
router.get('/:id_administrador', async (req: Request, res: Response) => {
    const administrador = await administradorServices.obtieneAdministrador(Number(req.params.id_administrador));
    res.send(administrador);
});

// http://localhost:3001/api/administrador/
router.post('/', async (req: Request, res: Response) => {
    try {
        const { nombre, apellido_paterno, apellido_materno, correo, telefono, contraseña, cargo } = req.body;
        const resultado = await administradorServices.registraAdministrador({
            nombre,
            apellido_paterno,
            apellido_materno,
            correo,
            telefono,
            contraseña,
            cargo,
            id_usuario: 0
        });
        res.send(resultado);
    } catch(e) {
        res.status(400).send('No se puede registrar el administrador');
    }
});

// http://localhost:3001/api/administrador
router.put('/', async (req: Request, res: Response) => {
    try {
        const { id_administrador, id_usuario, nombre, apellido_paterno, apellido_materno, correo, telefono, contraseña, cargo } = req.body;
        const modificado = await administradorServices.editaAdministrador({
            id_administrador,
            id_usuario,
            nombre,
            apellido_paterno,
            apellido_materno,
            correo,
            telefono,
            contraseña,
            cargo
        });
        res.send(modificado);
    } catch(e) {
        res.status(400).send('Error en los datos');
    }
});

// http://localhost:3001/api/administrador
router.delete('/', async (req: Request, res: Response) => {
    try {
        const { id_administrador } = req.body;
        const eliminado = await administradorServices.borrarAdministrador(Number(id_administrador));
        res.send(eliminado);
    } catch(e) {
        res.status(400).send('Error en los datos');
    }
});

export default router;