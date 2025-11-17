import express from 'express';
import {
  listarNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
  contarNoLeidas
} from '../controllers/notificaciones.controller.js';
import { auth } from '../auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

router.get('/', listarNotificaciones);
router.get('/contar', contarNoLeidas);
router.patch('/:id/leer', marcarLeida);
router.patch('/marcar-todas', marcarTodasLeidas);

export default router;

