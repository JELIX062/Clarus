import express from 'express';
import type { Request, Response } from 'express';
import * as usuarioServices from '../services/usuarioServices.js';

const router =express.Router();

//http://localhost:3001/api/usuario/
router.get('/',async(_req: Request, res: Response)=>{
    let usuario = await usuarioServices.obtieneUsuario();
    res.send(usuario);
})

//http://localhost:3001/api/usuario/1 ← numero de id del usuario
router.get('/:id_usuario',async(req: Request, res: Response)=>{
    let usuario = await usuarioServices.encuentraUsuario(Number(req.params.id_usuario)); 
    res.send(usuario);
})

// http://localhost:3001/api/usuario/login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { correo, contraseña } = req.body;

        if (!correo || !contraseña) {
            res.status(400).send({ error: 'Correo y contraseña son requeridos' });
            return;
        }

        const resultado = await usuarioServices.login(correo, contraseña);
        res.send(resultado);

    } catch(e) {
        res.status(400).send({ error: 'Error al iniciar sesión' });
    }
});

export default router;