import express from 'express';
import * as sucursalServices from '../services/sucursalServices.js';
const router = express.Router();
// http://localhost:3001/api/sucursal
router.get('/', async (_req, res) => {
    const sucursales = await sucursalServices.obtieneSucursales();
    res.send(sucursales);
});
// http://localhost:3001/api/sucursal/1
router.get('/:id_sucursal', async (req, res) => {
    const sucursal = await sucursalServices.obtieneSucursal(Number(req.params.id_sucursal));
    res.send(sucursal);
});
// http://localhost:3001/api/sucursal
router.post('/', async (req, res) => {
    try {
        const { id_administrador, nombre, calle, numero, colonia, ciudad, codigo_postal, telefono, correo } = req.body;
        const resultado = await sucursalServices.registraSucursal({
            id_administrador,
            nombre,
            calle,
            numero,
            colonia,
            ciudad,
            codigo_postal,
            telefono,
            correo,
            activa: 1
        });
        res.send(resultado);
    }
    catch (e) {
        res.status(400).send('No se puede registrar la sucursal');
    }
});
// http://localhost:3001/api/sucursal
router.put('/', async (req, res) => {
    try {
        const { id_sucursal, id_administrador, nombre, calle, numero, colonia, ciudad, codigo_postal, telefono, correo, activa } = req.body;
        const modificado = await sucursalServices.editaSucursal({
            id_sucursal,
            id_administrador,
            nombre,
            calle,
            numero,
            colonia,
            ciudad,
            codigo_postal,
            telefono,
            correo,
            activa
        });
        res.send(modificado);
    }
    catch (e) {
        res.status(400).send('Error en los datos');
    }
});
// http://localhost:3001/api/sucursal
router.delete('/', async (req, res) => {
    try {
        const { id_sucursal } = req.body;
        const eliminado = await sucursalServices.borrarSucursal(Number(id_sucursal));
        res.send(eliminado);
    }
    catch (e) {
        res.status(400).send('Error en los datos');
    }
});
export default router;
