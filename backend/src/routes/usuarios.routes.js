import express from 'express';
import {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  cambiarPassword,
  eliminarUsuario
} from '../controllers/usuarios.controller.js';
import { auth, requireRole } from '../auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(auth);
router.use(requireRole('administrador'));

router.get('/', listarUsuarios);
router.get('/:id', obtenerUsuario);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);
router.patch('/:id/password', cambiarPassword);
router.delete('/:id', eliminarUsuario);

export default router;

