import express from 'express';
import {
  login,
  me,
  solicitarRecuperacion,
  verificarTokenRecuperacion,
  restablecerPassword
} from '../controllers/auth.controller.js';
import { auth } from '../auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me - Obtener información del usuario actual
router.get('/me', auth, me);

// POST /api/auth/recuperar - Solicitar enlace de restablecimiento
router.post('/recuperar', solicitarRecuperacion);

// GET /api/auth/recuperar/:token - Verificar si el enlace sigue vigente
router.get('/recuperar/:token', verificarTokenRecuperacion);

// POST /api/auth/restablecer - Guardar la nueva contraseña
router.post('/restablecer', restablecerPassword);

export default router;
