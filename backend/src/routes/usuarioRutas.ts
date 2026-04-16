import express from 'express';
import type {Request,Response} from 'express';
import * as usuarioServices from '../services/usuarioServices.js';
const router =express.Router();

//http://localhost:3001/api/usuario/
router.get('/',async(_req: Request, res: Response)=>{
    let usuario = await usuarioServices.obtieneUsuario();
    res.send(usuario);
})

//http://localhost:3001/api/usuario/1 ← numero de id del usuario
router.get('/',async(req: Request, res: Response)=>{
    let usuario = await usuarioServices.encuentraUsuario(Number(req.params.id_usuario)); 
    res.send(usuario);
})
export default router;