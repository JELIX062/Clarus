import express from 'express';
import type {Request,Response} from 'express';
import * as usuarioServices from '../services/usuarioServices.js';
const router =express.Router();

//http://localhost:3001/api/clarusBD/
router.get('/',async(_req: Request, res: Response)=>{
    let usuario = await usuarioServices.obtieneUsuario();
    res.send(usuario);
})

export default router;