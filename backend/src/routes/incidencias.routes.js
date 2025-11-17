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
  resolverIncidencia
} from '../controllers/incidencias.controller.js';
import { auth } from '../auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

router.get('/', listarIncidencias);
router.get('/mis-incidencias', misIncidencias);
router.get('/:codigo', obtenerIncidencia);
router.post('/', crearIncidencia);
router.put('/:codigo', actualizarIncidencia);
router.patch('/:codigo/estado', cambiarEstado);
router.patch('/:codigo/prioridad', cambiarPrioridad);
router.patch('/:codigo/reasignar', reasignar);
router.post('/:codigo/resolver', resolverIncidencia);

export default router;

