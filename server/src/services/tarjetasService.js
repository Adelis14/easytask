import Tarjeta from '../models/Tarjeta.js';
import HistorialTarjeta from '../models/HistorialTarjeta.js';
import { ESTADOS_VALIDOS } from '../config/constants.js';

const toPublic = (t) => {
  const plain = t.toJSON ? t.toJSON() : t;
  return { ...plain, titulo: plain.nombre };
};

export class TarjetasService {
  static async listarPorTablero(tableroId) {
    const tarjetas = await Tarjeta.findAll({
      where: { tablero_id: parseInt(tableroId, 10) },
      order: [['id', 'ASC']]
    });
    return tarjetas.map(toPublic);
  }

  static async crear({ tablero_id, nombre, titulo, descripcion = '', checklist = [], fecha_inicio = null, fecha_vencimiento = null, fecha_culminacion = null, estado = 'Pendiente', responsable = '' }) {
    const finalNombre = nombre || titulo;
    if (!finalNombre) {
      const error = new Error('El nombre/título del compromiso es requerido');
      error.statusCode = 400;
      throw error;
    }

    const tarjeta = await Tarjeta.create({
      tablero_id: parseInt(tablero_id, 10),
      nombre: finalNombre,
      descripcion,
      checklist: Array.isArray(checklist) ? checklist : [],
      estado: ESTADOS_VALIDOS.includes(estado) ? estado : 'Pendiente',
      responsable,
      fecha_inicio: fecha_inicio || new Date(),
      fecha_vencimiento: fecha_vencimiento || null,
      fecha_culminacion: fecha_culminacion || null,
      creado_en: new Date(),
      actualizado_en: new Date()
    });

    return toPublic(tarjeta);
  }

  static async actualizarEstado(id, nuevoEstado, motivo = '') {
    const tid = parseInt(id, 10);
    const tarjeta = await Tarjeta.findByPk(tid);

    if (!tarjeta) {
      const error = new Error('Compromiso no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const estadoAnterior = tarjeta.estado;
    const fechaCulminacion = nuevoEstado === 'Verificado' ? new Date() : tarjeta.fecha_culminacion;

    await tarjeta.update({
      estado: nuevoEstado,
      fecha_culminacion: fechaCulminacion,
      actualizado_en: new Date()
    });

    // Registrar historial de auditoría
    if (estadoAnterior !== nuevoEstado) {
      await HistorialTarjeta.create({
        tarjeta_id: tid,
        estado_anterior: estadoAnterior,
        estado_nuevo: nuevoEstado,
        descripcion: motivo || `Cambio de estado: ${estadoAnterior} -> ${nuevoEstado}`,
        fecha: new Date()
      });
    }

    return { ...toPublic(tarjeta), estado_anterior: estadoAnterior };
  }

  static async actualizarChecklist(id, checklist) {
    const tid = parseInt(id, 10);
    const tarjeta = await Tarjeta.findByPk(tid);

    if (!tarjeta) {
      const error = new Error('Compromiso no encontrado');
      error.statusCode = 404;
      throw error;
    }

    await tarjeta.update({
      checklist: Array.isArray(checklist) ? checklist : [],
      actualizado_en: new Date()
    });

    return toPublic(tarjeta);
  }

  static async eliminar(id) {
    const tid = parseInt(id, 10);
    const rows = await Tarjeta.destroy({ where: { id: tid } });
    return rows > 0;
  }

  static async obtenerHistorial(tarjetaId) {
    return HistorialTarjeta.findAll({
      where: { tarjeta_id: parseInt(tarjetaId, 10) },
      order: [['fecha', 'DESC']]
    });
  }
}
