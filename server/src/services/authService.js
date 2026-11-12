import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, usePostgres, memoryStore } from '../config/db.js';
import { config } from '../config/env.js';

export class AuthService {
  static async registrar({ nombre, apellido = '', usuario, email, telefono = '', password }) {
    const username = usuario || email.split('@')[0];
    const passwordHash = await bcrypt.hash(password, 10);

    if (usePostgres) {
      const checkUser = await query(
        'SELECT id FROM usuarios WHERE email = $1 OR usuario = $2',
        [email, username]
      );
      if (checkUser.rows.length > 0) {
        const error = new Error('El email o nombre de usuario ya está registrado');
        error.statusCode = 409;
        throw error;
      }

      const result = await query(
        `INSERT INTO usuarios (nombre, apellido, usuario, email, telefono, password)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, nombre, apellido, usuario, email, telefono, fecha_creacion`,
        [nombre, apellido, username, email, telefono, passwordHash]
      );
      const user = result.rows[0];
      const token = jwt.sign(
        { id: user.id, email: user.email, nombre: user.nombre, usuario: user.usuario },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );
      return { usuario: user, token };
    } else {
      const exists = memoryStore.usuarios.some(
        u => u.email === email || (u.usuario && u.usuario === username)
      );
      if (exists) {
        const error = new Error('El email o nombre de usuario ya está registrado');
        error.statusCode = 409;
        throw error;
      }

      const newUser = {
        id: memoryStore.userIdSeq++,
        nombre,
        apellido,
        usuario: username,
        email,
        telefono,
        password: passwordHash,
        password_hash: passwordHash,
        fecha_creacion: new Date(),
        creado_en: new Date()
      };
      memoryStore.usuarios.push(newUser);

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, nombre: newUser.nombre, usuario: newUser.usuario },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      return {
        usuario: {
          id: newUser.id,
          nombre: newUser.nombre,
          apellido: newUser.apellido,
          usuario: newUser.usuario,
          email: newUser.email,
          telefono: newUser.telefono,
          fecha_creacion: newUser.fecha_creacion
        },
        token
      };
    }
  }

  static async login({ email, password }) {
    if (usePostgres) {
      const result = await query(
        'SELECT * FROM usuarios WHERE email = $1 OR usuario = $1',
        [email]
      );
      if (result.rows.length === 0) {
        const error = new Error('Credenciales incorrectas');
        error.statusCode = 401;
        throw error;
      }

      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password || user.password_hash);
      if (!valid) {
        const error = new Error('Credenciales incorrectas');
        error.statusCode = 401;
        throw error;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, nombre: user.nombre, usuario: user.usuario },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      return {
        usuario: {
          id: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          usuario: user.usuario,
          email: user.email,
          telefono: user.telefono
        },
        token
      };
    } else {
      const user = memoryStore.usuarios.find(
        u => u.email === email || (u.usuario && u.usuario === email)
      );
      if (!user) {
        const error = new Error('Credenciales incorrectas');
        error.statusCode = 401;
        throw error;
      }

      const valid = await bcrypt.compare(password, user.password || user.password_hash);
      if (!valid) {
        const error = new Error('Credenciales incorrectas');
        error.statusCode = 401;
        throw error;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, nombre: user.nombre, usuario: user.usuario },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      return {
        usuario: {
          id: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          usuario: user.usuario,
          email: user.email,
          telefono: user.telefono
        },
        token
      };
    }
  }
}
