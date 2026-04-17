import express from 'express';
import * as usuarioServices from '../services/usuarioServices.js';
const router = express.Router();
//http://localhost:3001/api/usuario/
router.get('/', async (_req, res) => {
    let usuario = await usuarioServices.obtieneUsuario();
    res.send(usuario);
});
//http://localhost:3001/api/usuario/1 ← numero de id del usuario
router.get('/:id_usuario', async (req, res) => {
    let usuario = await usuarioServices.encuentraUsuario(Number(req.params.id_usuario));
    res.send(usuario);
});
router.post('/', async (req, res) => {
    try {
        const { nombre, apellido_paterno, apellido_materno, correo, telefono, contraseña } = req.body;
        const nuevoUsuario = await usuarioServices.agregaUsuario({
            nombre,
            apellido_paterno,
            apellido_materno,
            correo,
            telefono,
            contraseña
        });
        res.send(nuevoUsuario);
    }
    catch (e) {
        console.log("ERROR:", e);
        res.send('No se puede agregar el usuario');
        //res.status(400).send('Error en los datos')
    }
});
export default router;
