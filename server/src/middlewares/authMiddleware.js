import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Acceso no autorizado: Se requiere un token válido para acceder a este recurso de EasyTask.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      error: 'Token inválido o expirado. Por favor inicia sesión nuevamente.'
    });
  }
};
