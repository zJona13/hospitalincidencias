import express from 'express';
import {
  listarTipos,
  obtenerTipo,
  crearTipo,
  actualizarTipo,
  eliminarTipo
} from '../controllers/tipos.controller.js';
import { auth, requireRole } from '../auth.js';

const router = express.Router();

router.use(auth);
router.use(requireRole('administrador'));

router.get('/', listarTipos);
router.get('/:id', obtenerTipo);
router.post('/', crearTipo);
router.put('/:id', actualizarTipo);
router.delete('/:id', eliminarTipo);

export default router;

