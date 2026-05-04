import express from 'express';
import type { Request, Response } from 'express';
import * as pagoServices from '../services/pagoServices.js';

const router = express.Router();

// http://localhost:3001/api/pago
router.get('/', async (_req: Request, res: Response) => {
    const pagos = await pagoServices.obtienePagos();
    res.send(pagos);
});

// http://localhost:3001/api/pago/1
router.get('/:id_pago', async (req: Request, res: Response) => {
    const pago = await pagoServices.obtienePago(Number(req.params.id_pago));
    res.send(pago);
});

// http://localhost:3001/api/pago/cita/1
router.get('/cita/:id_cita', async (req: Request, res: Response) => {
    const pagos = await pagoServices.obtienePagosPorCita(Number(req.params.id_cita));
    res.send(pagos);
});

// http://localhost:3001/api/pago/final
router.post('/final', async (req: Request, res: Response) => {
    try {
        const { id_cita, metodo_pago, referencia, registrado_por } = req.body;
        const resultado = await pagoServices.registraPagoFinal({
            id_cita,
            metodo_pago,
            tipo_pago: 'Total',
            monto: 0,
            referencia,
            registrado_por,
            estado: 'Completado'
        });
        res.send(resultado);
    } catch(e) {
        res.status(400).send('No se puede registrar el pago final');
    }
});

export default router;