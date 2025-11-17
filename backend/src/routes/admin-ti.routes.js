import express from 'express';
import { auth, requireRole, requireAdminType } from '../auth.js';
import {
  asignarIncidencia,
  listarIncidenciasPendientesAsignacion,
  reasignarIncidencia,
  obtenerEstadisticasAsignaciones
} from '../controllers/admin-ti.controller.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

// Todas las rutas requieren ser administrador TI
router.use(requireRole('administrador'));
router.use(requireAdminType('ti'));

// Rutas
router.post('/incidencias/:codigo/asignar', asignarIncidencia);
router.get('/incidencias/pendientes', listarIncidenciasPendientesAsignacion);
router.patch('/incidencias/:codigo/reasignar', reasignarIncidencia);
router.get('/estadisticas', obtenerEstadisticasAsignaciones);

export default router;

