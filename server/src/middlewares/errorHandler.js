export const errorHandler = (err, req, res, next) => {
  console.error('[UNHANDLED ERROR]', {
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Error interno del servidor en EasyTask',
    timestamp: new Date().toISOString()
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
};
