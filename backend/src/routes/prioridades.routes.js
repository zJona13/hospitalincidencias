import express from 'express';
import {
  listarPrioridades,
  obtenerPrioridad,
  crearPrioridad,
  actualizarPrioridad,
  eliminarPrioridad
} from '../controllers/prioridades.controller.js';
import { auth, requireRole } from '../auth.js';

const router = express.Router();

router.use(auth);
router.use(requireRole('administrador'));

router.get('/', listarPrioridades);
router.get('/:id', obtenerPrioridad);
router.post('/', crearPrioridad);
router.put('/:id', actualizarPrioridad);
router.delete('/:id', eliminarPrioridad);

export default router;

