import { AuthService } from '../services/authService.js';

export class AuthController {
  static async registro(req, res, next) {
    try {
      const { nombre, apellido, usuario, email, telefono, password } = req.body;
      const resultado = await AuthService.registrar({
        nombre,
        apellido,
        usuario,
        email,
        telefono,
        password
      });
      return res.status(201).json(resultado);
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const resultado = await AuthService.login({ email, password });
      return res.status(200).json(resultado);
    } catch (err) {
      next(err);
    }
  }

  static async perfil(req, res) {
    return res.status(200).json({ usuario: req.usuario });
  }
}
