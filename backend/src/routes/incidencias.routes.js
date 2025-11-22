import express from 'express';
import {
  listarIncidencias,
  obtenerIncidencia,
  crearIncidencia,
  actualizarIncidencia,
  cambiarEstado,
  cambiarPrioridad,
  reasignar,
  misIncidencias,
  resolverIncidencia,
  obtenerIncidenciasRelacionadas,
  buscarIncidenciasRelacionadas
} from '../controllers/incidencias.controller.js';
import { auth } from '../auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

// Rutas específicas primero (sin parámetros)
router.get('/', listarIncidencias);
router.get('/mis-incidencias', misIncidencias);
router.get('/relacionadas', buscarIncidenciasRelacionadas);

// Rutas específicas con parámetros (antes de la genérica)
router.get('/:codigo/relacionadas', obtenerIncidenciasRelacionadas);

// Ruta genérica con parámetro (última)
router.get('/:codigo', obtenerIncidencia);
router.post('/', crearIncidencia);
router.put('/:codigo', actualizarIncidencia);
router.patch('/:codigo/estado', cambiarEstado);
router.patch('/:codigo/prioridad', cambiarPrioridad);
router.patch('/:codigo/reasignar', reasignar);
router.post('/:codigo/resolver', resolverIncidencia);

export default router;

