import express from 'express';
import { listarComentarios, agregarComentario } from '../controllers/comentarios.controller.js';
import { auth } from '../auth.js';

const router = express.Router({ mergeParams: true });

// Todas las rutas requieren autenticación
router.use(auth);

router.get('/:codigo/comentarios', listarComentarios);
router.post('/:codigo/comentarios', agregarComentario);

export default router;

