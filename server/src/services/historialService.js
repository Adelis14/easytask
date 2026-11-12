import { query, usePostgres, memoryStore } from '../config/db.js';

export class HistorialService {
  static async listarPorTarjeta(tarjetaId) {
    const tid = parseInt(tarjetaId, 10);
    if (usePostgres) {
      const res = await query(
        `SELECT id, tarjeta_id, estado_anterior, estado_nuevo, descripcion, fecha
         FROM historial_tarjetas
         WHERE tarjeta_id = $1
         ORDER BY fecha DESC, id DESC`,
        [tid]
      );
      return res.rows.map(r => ({
        ...r,
        fecha_cambio: r.fecha,
        motivo: r.descripcion
      }));
    } else {
      return memoryStore.historial
        .filter(h => h.tarjeta_id === tid)
        .sort((a, b) => new Date(b.fecha || b.fecha_cambio) - new Date(a.fecha || a.fecha_cambio))
        .map(h => ({
          ...h,
          fecha: h.fecha || h.fecha_cambio,
          fecha_cambio: h.fecha || h.fecha_cambio,
          motivo: h.descripcion || h.motivo || 'Actualización de flujo'
        }));
    }
  }
}
