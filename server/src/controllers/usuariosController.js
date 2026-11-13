import Usuario from '../models/Usuario.js';
import { AuthService } from '../services/authService.js';

export class UsuariosController {
  static async listar(req, res, next) {
    try {
      const usuarios = await Usuario.findAll({
        attributes: ['id', 'nombre', 'apellido', 'usuario', 'email', 'telefono', 'fecha_creacion'],
        order: [['id', 'ASC']]
      });
      return res.status(200).json(usuarios);
    } catch (err) {
      next(err);
    }
  }

  static async crear(req, res, next) {
    try {
      const { nombre, apellido, usuario, email, telefono, password } = req.body;
      if (!nombre || !email) {
        return res.status(400).json({ error: 'El nombre y correo electrónico son obligatorios.' });
      }
      const pass = password || 'cambiame123';
      const result = await AuthService.registrar({
        nombre,
        apellido,
        usuario,
        email,
        telefono,
        password: pass
      });
      return res.status(201).json(result.usuario);
    } catch (err) {
      next(err);
    }
  }
}
