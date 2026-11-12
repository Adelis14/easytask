import { config } from '../config/env.js';

/**
 * Middleware para monitoreo de SLA (< 1.2s = 1200ms)
 * Calcula el tiempo exacto de resolución de cada solicitud,
 * agrega el encabezado X-Response-Time y emite alertas ante posibles cuellos de botella.
 */
export const slaMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const elapsed = Date.now() - start;
    
    if (elapsed > config.slaLimitMs) {
      console.warn(`⚠️ [SLA VIOLATION] ${req.method} ${req.originalUrl} tardó ${elapsed}ms (> ${config.slaLimitMs}ms SLA)`);
    }
  });

  // Intercepta res.writeHead o res.send para inyectar cabecera X-Response-Time
  const originalEnd = res.end;
  res.end = function (...args) {
    const elapsed = Date.now() - start;
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${elapsed}ms`);
      res.setHeader('X-SLA-Threshold', `${config.slaLimitMs}ms`);
    }
    return originalEnd.apply(this, args);
  };

  next();
};
