import express from 'express';
import { obtenerHistorial } from '../controllers/historial.controller.js';
import { auth } from '../auth.js';

const router = express.Router({ mergeParams: true });

// Todas las rutas requieren autenticación
router.use(auth);

router.get('/:codigo/historial', obtenerHistorial);

export default router;

