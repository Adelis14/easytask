import { ESTADOS_VALIDOS } from '../config/constants.js';

export const validateRegistro = (req, res, next) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Campos requeridos: nombre, email y password son obligatorios' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe contener al menos 6 caracteres' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'El formato del email proporcionado no es válido' });
  }
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password requeridos para iniciar sesión' });
  }
  next();
};

export const validateEstadoCompromiso = (req, res, next) => {
  const { nuevo_estado } = req.body;
  if (!nuevo_estado) {
    return res.status(400).json({ error: 'El campo nuevo_estado es obligatorio' });
  }
  if (!ESTADOS_VALIDOS.includes(nuevo_estado)) {
    return res.status(400).json({
      error: `Estado inválido. Los estados permitidos son estrictamente: ${ESTADOS_VALIDOS.join(', ')}`
    });
  }
  next();
};
