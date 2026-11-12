import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateRegistro, validateLogin } from '../middlewares/validatorMiddleware.js';

const router = Router();

router.post('/registro', validateRegistro, AuthController.registro);
router.post('/login', validateLogin, AuthController.login);
router.get('/me', authMiddleware, AuthController.perfil);

export default router;
