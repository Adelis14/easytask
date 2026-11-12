import express from 'express';
import cors from 'cors';
import { slaMiddleware } from './middlewares/slaMiddleware.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import compromisosRoutes from './routes/compromisosRoutes.js';
import tablerosRoutes from './routes/tablerosRoutes.js';
import apiRouter from './routes/index.js';

const app = express();

// 1. Monitoreo de Rendimiento (< 1.2s SLA)
app.use(slaMiddleware);

// 2. Seguridad y Parsers
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// 3. Montaje de rutas del Subsistema 3.0 (Compromisos y Minutas)
app.use('/api/compromisos', compromisosRoutes);
app.use('/api/tableros', tablerosRoutes);

// 4. Montaje de rutas adicionales de la API (/api/auth, /api/salud, etc.)
app.use('/api', apiRouter);

// 5. Manejador de 404 y Errores Globales
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
