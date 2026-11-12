import { TablerosService } from '../services/tablerosService.js';

export class TablerosController {
  static async listar(req, res, next) {
    try {
      const usuarioId = req.usuario.id;
      const tableros = await TablerosService.listarPorUsuario(usuarioId);
      return res.status(200).json(tableros);
    } catch (err) {
      next(err);
    }
  }

  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const usuarioId = req.usuario.id;
      const tablero = await TablerosService.obtenerPorId(id, usuarioId);
      if (!tablero) {
        return res.status(404).json({ error: 'Minuta / Tablero no encontrado' });
      }
      return res.status(200).json(tablero);
    } catch (err) {
      next(err);
    }
  }

  static async crear(req, res, next) {
    try {
      const { nombre } = req.body;
      if (!nombre || !nombre.trim()) {
        return res.status(400).json({ error: 'El nombre de la minuta es obligatorio' });
      }
      const usuarioId = req.usuario.id;
      const nuevoTablero = await TablerosService.crear({ nombre: nombre.trim(), usuarioId });
      return res.status(201).json(nuevoTablero);
    } catch (err) {
      next(err);
    }
  }

  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const usuarioId = req.usuario.id;
      const eliminado = await TablerosService.eliminar(id, usuarioId);
      if (!eliminado) {
        return res.status(404).json({ error: 'Minuta / Tablero no encontrado' });
      }
      return res.status(200).json({ mensaje: 'Minuta eliminada con éxito' });
    } catch (err) {
      next(err);
    }
  }
}
