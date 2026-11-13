import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import Usuario from '../models/Usuario.js';
import { config } from '../config/env.js';

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, nombre: user.nombre, usuario: user.usuario },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

const publicUser = (user) => ({
  id: user.id,
  nombre: user.nombre,
  apellido: user.apellido,
  usuario: user.usuario,
  email: user.email,
  telefono: user.telefono,
  fecha_creacion: user.fecha_creacion
});

export class AuthService {
  static async registrar({ nombre, apellido = '', usuario, email, telefono = '', password }) {
    const username = usuario || email.split('@')[0];

    const existe = await Usuario.findOne({
      where: {
        [Op.or]: [{ email }, { usuario: username }]
      }
    });

    if (existe) {
      const error = new Error('El email o nombre de usuario ya está registrado');
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await Usuario.create({
      nombre,
      apellido,
      usuario: username,
      email,
      telefono,
      password: passwordHash
    });

    return { usuario: publicUser(user), token: signToken(user) };
  }

  static async login({ email, password }) {
    const user = await Usuario.findOne({
      where: {
        [Op.or]: [{ email }, { usuario: email }]
      }
    });

    if (!user) {
      const error = new Error('Credenciales incorrectas');
      error.statusCode = 401;
      throw error;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      const error = new Error('Credenciales incorrectas');
      error.statusCode = 401;
      throw error;
    }

    return { usuario: publicUser(user), token: signToken(user) };
  }
}
