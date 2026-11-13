import HistorialTarjeta from '../models/HistorialTarjeta.js';

export class HistorialService {
  static async listarPorTarjeta(tarjetaId) {
    const tid = parseInt(tarjetaId, 10);
    const registros = await HistorialTarjeta.findAll({
      where: { tarjeta_id: tid },
      order: [['fecha', 'DESC'], ['id', 'DESC']]
    });
    return registros.map(r => ({
      ...r.toJSON(),
      fecha_cambio: r.fecha,
      motivo: r.descripcion
    }));
  }
}
