import express from 'express';
import { subirArchivo, descargarArchivo, listarArchivos, eliminarArchivo } from '../controllers/archivos.controller.js';
import { upload } from '../middleware/upload.js';
import { auth } from '../auth.js';

const router = express.Router({ mergeParams: true });

// Todas las rutas requieren autenticación
router.use(auth);

router.get('/:codigo/archivos', listarArchivos);
router.post('/:codigo/archivos', upload.single('archivo'), subirArchivo);
router.get('/archivos/:id/descargar', descargarArchivo);
router.delete('/archivos/:id', eliminarArchivo);

export default router;

