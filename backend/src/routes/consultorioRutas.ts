import express from 'express';
import type { Request, Response } from 'express';
import * as consultorioServices from '../services/consultorioServices.js';

const router = express.Router();

// http://localhost:3001/api/consultorio
router.get('/', async (_req: Request, res: Response) => {
    const consultorios = await consultorioServices.obtieneConsultorios();
    res.send(consultorios);
});

// http://localhost:3001/api/consultorio/1
router.get('/:id_consultorio', async (req: Request, res: Response) => {
    const consultorio = await consultorioServices.obtieneConsultorio(Number(req.params.id_consultorio));
    res.send(consultorio);
});

// http://localhost:3001/api/consultorio
router.post('/', async (req: Request, res: Response) => {
    try {
        const { id_sucursal, numero, piso, descripcion } = req.body;
        const resultado = await consultorioServices.registraConsultorio({
            id_sucursal,
            numero,
            piso,
            descripcion,
            activo: 1
        });
        res.send(resultado);
    } catch(e) {
        res.status(400).send('No se puede registrar el consultorio');
    }
});

// http://localhost:3001/api/consultorio
router.put('/', async (req: Request, res: Response) => {
    try {
        const { id_consultorio, id_sucursal, numero, piso, descripcion, activo } = req.body;
        const modificado = await consultorioServices.editaConsultorio({
            id_consultorio,
            id_sucursal,
            numero,
            piso,
            descripcion,
            activo
        });
        res.send(modificado);
    } catch(e) {
        res.status(400).send('Error en los datos');
    }
});

// http://localhost:3001/api/consultorio
router.delete('/', async (req: Request, res: Response) => {
    try {
        const { id_consultorio } = req.body;
        const eliminado = await consultorioServices.borrarConsultorio(Number(id_consultorio));
        res.send(eliminado);
    } catch(e) {
        res.status(400).send('Error en los datos');
    }
});

export default router;