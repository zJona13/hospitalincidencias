import express from 'express';
import {
  listarAreas,
  obtenerArea,
  crearArea,
  actualizarArea,
  eliminarArea
} from '../controllers/areas.controller.js';
import { auth, requireRole } from '../auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(auth);
router.use(requireRole('administrador'));

router.get('/', listarAreas);
router.get('/:id', obtenerArea);
router.post('/', crearArea);
router.put('/:id', actualizarArea);
router.delete('/:id', eliminarArea);

export default router;

