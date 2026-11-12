import { Router } from 'express';
import { TablerosController } from '../controllers/tablerosController.js';
import { CompromisosController } from '../controllers/compromisosController.js';
import { TarjetasController } from '../controllers/tarjetasController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas de minutas/tableros requieren autenticación
router.use(authMiddleware);

// CRUD de Minutas / Tableros de Reunión
router.get('/', TablerosController.listar);
router.post('/', TablerosController.crear);
router.get('/:id', TablerosController.obtenerPorId);
router.delete('/:id', TablerosController.eliminar);

// GET /api/tableros/:id/compromisos -> Compromisos con semáforo dinámico inyectado (Subsistema 3.0)
router.get('/:id/compromisos', CompromisosController.obtenerPorTablero);

// Compatibilidad con endpoints heredados
router.get('/:id/tarjetas', TarjetasController.listarPorTablero);

export default router;
