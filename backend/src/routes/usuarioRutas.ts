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

router.post('/',async(req: Request, res: Response)=>{
    try{
        const {nombre, apellido_paterno, apellido_materno, correo, telefono, contraseña, fecha_nacimiento, sexo, tipo_sangre} = req.body;
        const nuevoUsuario = await usuarioServices.agregaUsuario({
            nombre,
            apellido_paterno,
            apellido_materno,
            correo,
            telefono,
            contraseña,
            fecha_nacimiento,
            sexo,
            tipo_sangre
        });
        res.send(nuevoUsuario);
    }catch(e){
        console.log("ERROR:", e);
        res.send('No se puede agregar el usuario');
    }
});


export default router;