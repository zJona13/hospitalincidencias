import express from 'express';
import { getAreas, getServicios, getTipos, getSubtipos, getPrioridades, getUsuarios } from '../controllers/catalogos.controller.js';
import { auth } from '../auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

router.get('/areas', getAreas);
router.get('/servicios', getServicios);
router.get('/tipos', getTipos);
router.get('/subtipos', getSubtipos);
router.get('/prioridades', getPrioridades);
router.get('/usuarios', getUsuarios);

export default router;

