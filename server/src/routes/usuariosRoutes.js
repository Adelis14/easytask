import { Router } from 'express';
import { UsuariosController } from '../controllers/usuariosController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Directorio de usuarios autenticado
router.get('/', authMiddleware, UsuariosController.listar);

export default router;
