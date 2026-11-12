import { Router } from 'express';
import authRoutes from './authRoutes.js';
import tablerosRoutes from './tablerosRoutes.js';
import compromisosRoutes from './compromisosRoutes.js';
import tarjetasRoutes from './tarjetasRoutes.js';
import usuariosRoutes from './usuariosRoutes.js';
import { ESTADOS_VALIDOS, SLA_MAX_MS } from '../config/constants.js';
import { usePostgres } from '../config/db.js';

const apiRouter = Router();

// Endpoint de diagnóstico y salud del sistema
apiRouter.get('/salud', (req, res) => {
  res.status(200).json({
    estado: 'activo',
    servicio: 'EasyTask API Backend',
    sla_max_ms: SLA_MAX_MS,
    modo_persistencia: usePostgres ? 'PostgreSQL' : 'In-Memory Storage (Demo)',
    estados_admitidos: ESTADOS_VALIDOS,
    timestamp: new Date().toISOString()
  });
});

// Montaje de rutas modulares
apiRouter.use('/auth', authRoutes);
apiRouter.use('/tableros', tablerosRoutes);
apiRouter.use('/compromisos', compromisosRoutes);
apiRouter.use('/tarjetas', tarjetasRoutes);
apiRouter.use('/usuarios', usuariosRoutes);

export default apiRouter;
