import express from 'express';
import type { Request, Response } from 'express';
import * as rolServices from '../services/rolServices.js';

const router = express.Router();

// http://localhost:3001/api/rol
router.get('/', async (_req: Request, res: Response) => {
    const roles = await rolServices.obtieneRoles();
    res.send(roles);
});

// http://localhost:3001/api/rol/1 + numero de id del rol
router.get('/:id_rol', async (req: Request, res: Response) => {
    const rol = await rolServices.obtieneRol(Number(req.params.id_rol));
    res.send(rol);
});

export default router;