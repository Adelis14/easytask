import { TarjetasService } from '../services/tarjetasService.js';

export class TarjetasController {
  static async listarPorTablero(req, res, next) {
    try {
      const { id } = req.params;
      const tarjetas = await TarjetasService.listarPorTablero(id);
      return res.status(200).json(tarjetas);
    } catch (err) {
      next(err);
    }
  }

  static async crear(req, res, next) {
    try {
      const {
        tablero_id,
        nombre,
        titulo,
        descripcion,
        checklist,
        fecha_inicio,
        fecha_vencimiento,
        fecha_culminacion,
        estado,
        responsable
      } = req.body;

      if (!tablero_id) {
        return res.status(400).json({ error: 'El tablero_id es obligatorio' });
      }

      const nuevaTarjeta = await TarjetasService.crear({
        tablero_id,
        nombre,
        titulo,
        descripcion,
        checklist,
        fecha_inicio,
        fecha_vencimiento,
        fecha_culminacion,
        estado,
        responsable
      });

      return res.status(201).json(nuevaTarjeta);
    } catch (err) {
      next(err);
    }
  }

  static async actualizarEstado(req, res, next) {
    try {
      const { id } = req.params;
      const { nuevo_estado, motivo } = req.body;

      const tarjetaActualizada = await TarjetasService.actualizarEstado(id, nuevo_estado, motivo);
      return res.status(200).json(tarjetaActualizada);
    } catch (err) {
      next(err);
    }
  }

  static async actualizarChecklist(req, res, next) {
    try {
      const { id } = req.params;
      const { checklist } = req.body;

      if (!Array.isArray(checklist)) {
        return res.status(400).json({ error: 'El checklist debe ser un array' });
      }

      const tarjetaActualizada = await TarjetasService.actualizarChecklist(id, checklist);
      return res.status(200).json(tarjetaActualizada);
    } catch (err) {
      next(err);
    }
  }

  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const eliminado = await TarjetasService.eliminar(id);
      if (!eliminado) {
        return res.status(404).json({ error: 'Compromiso no encontrado' });
      }
      return res.status(200).json({ mensaje: 'Compromiso eliminado correctamente' });
    } catch (err) {
      next(err);
    }
  }
}
