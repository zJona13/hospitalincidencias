import express from 'express';
import { auth, requireRole, requireAdminType } from '../auth.js';
import {
  obtenerPredicciones,
  obtenerPrediccionDetalle,
  obtenerImpactoEstimado,
  obtenerReportesAvanzados,
  obtenerMetricasDirector
} from '../controllers/analiticas.controller.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

// Ruta accesible para todos los administradores (TI y General)
router.get('/reportes-avanzados', requireRole('administrador'), obtenerReportesAvanzados);

// Rutas exclusivas del director (requieren admin general)
router.get('/predicciones', requireRole('administrador'), requireAdminType('general'), obtenerPredicciones);
router.get('/predicciones/:id', requireRole('administrador'), requireAdminType('general'), obtenerPrediccionDetalle);
router.get('/impacto', requireRole('administrador'), requireAdminType('general'), obtenerImpactoEstimado);
router.get('/metricas-director', requireRole('administrador'), requireAdminType('general'), obtenerMetricasDirector);

export default router;

