import { Router } from 'express';
import { TarjetasController } from '../controllers/tarjetasController.js';
import { HistorialController } from '../controllers/historialController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateEstadoCompromiso } from '../middlewares/validatorMiddleware.js';

const router = Router();

// Todas las rutas de compromisos requieren autenticación
router.use(authMiddleware);

router.post('/', TarjetasController.crear);
router.patch('/:id/estado', validateEstadoCompromiso, TarjetasController.actualizarEstado);
router.patch('/:id/checklist', TarjetasController.actualizarChecklist);
router.delete('/:id', TarjetasController.eliminar);

// Historial de auditoría de un compromiso
router.get('/:id/historial', HistorialController.obtenerPorTarjeta);

export default router;
