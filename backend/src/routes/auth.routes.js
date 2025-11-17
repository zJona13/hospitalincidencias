import express from 'express';
import { login, me } from '../controllers/auth.controller.js';
import { auth } from '../auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me - Obtener información del usuario actual
router.get('/me', auth, me);

export default router;

