import express from 'express';
import * as usuarioServices from '../services/usuarioServices.js';
const router = express.Router();
//http://localhost:3001/api/clarusBD/
router.get('/', async (_req, res) => {
    let usuario = await usuarioServices.obtieneUsuario();
    res.send(usuario);
});
export default router;
