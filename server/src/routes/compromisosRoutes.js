import { Router } from 'express';
import { CompromisosController } from '../controllers/compromisosController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Middleware de autenticación para asegurar acceso a compromisos
router.use(authMiddleware);

// POST /api/compromisos -> Registra un nuevo compromiso en una minuta
router.post('/', CompromisosController.crearCompromiso);

// PUT /api/compromisos/:id/estado -> Actualiza el estado del compromiso (4 estados canónicos)
router.put('/:id/estado', CompromisosController.actualizarEstado);
// Alias PATCH para interoperabilidad
router.patch('/:id/estado', CompromisosController.actualizarEstado);

export default router;
