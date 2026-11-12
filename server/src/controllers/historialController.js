import { HistorialService } from '../services/historialService.js';

export class HistorialController {
  static async obtenerPorTarjeta(req, res, next) {
    try {
      const { id } = req.params;
      const historial = await HistorialService.listarPorTarjeta(id);
      return res.status(200).json(historial);
    } catch (err) {
      next(err);
    }
  }
}
