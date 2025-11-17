import express from 'express';
import { obtenerEstadisticas, obtenerTendencias, obtenerDistribuciones } from '../controllers/dashboard.controller.js';
import { auth } from '../auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

router.get('/estadisticas', obtenerEstadisticas);
router.get('/tendencias', obtenerTendencias);
router.get('/distribuciones', obtenerDistribuciones);

export default router;

