import express from 'express';
import * as rolServices from '../services/rolServices.js';
const router = express.Router();
// http://localhost:3001/api/rol
router.get('/', async (_req, res) => {
    const roles = await rolServices.obtieneRoles();
    res.send(roles);
});
// http://localhost:3001/api/rol/1 + numero de id del rol
router.get('/:id_rol', async (req, res) => {
    const rol = await rolServices.obtieneRol(Number(req.params.id_rol));
    res.send(rol);
});
export default router;
