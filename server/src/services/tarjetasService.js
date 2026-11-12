import { query, usePostgres, memoryStore } from '../config/db.js';
import { ESTADOS_VALIDOS, TRANSICIONES_PERMITIDAS } from '../config/constants.js';

export class TarjetasService {
  static async listarPorTablero(tableroId) {
    const tid = parseInt(tableroId, 10);
    if (usePostgres) {
      const res = await query(
        `SELECT id, nombre, descripcion, checklist, estado, tablero_id, fecha_inicio, fecha_vencimiento, fecha_culminacion
         FROM tarjetas
         WHERE tablero_id = $1
         ORDER BY id ASC`,
        [tid]
      );
      // Mapear para compatibilidad con frontend si usa titulo
      return res.rows.map(r => ({
        ...r,
        titulo: r.nombre
      }));
    } else {
      return memoryStore.tarjetas
        .filter(t => t.tablero_id === tid)
        .map(t => ({
          ...t,
          titulo: t.nombre || t.titulo
        }));
    }
  }

  static async crear({ tablero_id, nombre, titulo, descripcion = '', checklist = [], fecha_inicio = null, fecha_vencimiento = null, fecha_culminacion = null, estado = 'Pendiente', responsable = '' }) {
    const finalNombre = nombre || titulo;
    if (!finalNombre) {
      const error = new Error('El nombre/título del compromiso es requerido');
      error.statusCode = 400;
      throw error;
    }

    const tid = parseInt(tablero_id, 10);
    const initialChecklist = Array.isArray(checklist) ? checklist : [];

    if (usePostgres) {
      const res = await query(
        `INSERT INTO tarjetas (nombre, descripcion, checklist, estado, tablero_id, fecha_inicio, fecha_vencimiento, fecha_culminacion)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, nombre, descripcion, checklist, estado, tablero_id, fecha_inicio, fecha_vencimiento, fecha_culminacion`,
        [
          finalNombre,
          descripcion,
          JSON.stringify(initialChecklist),
          estado,
          tid,
          fecha_inicio || new Date(),
          fecha_vencimiento,
          fecha_culminacion
        ]
      );
      const row = res.rows[0];
      return { ...row, titulo: row.nombre };
    } else {
      const nuevaTarjeta = {
        id: memoryStore.tarjetaIdSeq++,
        tablero_id: tid,
        nombre: finalNombre,
        titulo: finalNombre,
        descripcion,
        checklist: initialChecklist,
        estado: ESTADOS_VALIDOS.includes(estado) ? estado : 'Pendiente',
        responsable,
        fecha_inicio: fecha_inicio || new Date().toISOString(),
        fecha_vencimiento,
        fecha_culminacion,
        creado_en: new Date(),
        actualizado_en: new Date()
      };
      memoryStore.tarjetas.push(nuevaTarjeta);
      return nuevaTarjeta;
    }
  }

  static async actualizarEstado(id, nuevoEstado, motivo = '') {
    const tid = parseInt(id, 10);

    if (usePostgres) {
      // Obtener estado anterior
      const currentRes = await query('SELECT id, estado FROM tarjetas WHERE id = $1', [tid]);
      if (currentRes.rows.length === 0) {
        const error = new Error('Compromiso no encontrado');
        error.statusCode = 404;
        throw error;
      }

      const estadoAnterior = currentRes.rows[0].estado;
      const fechaCulminacion = nuevoEstado === 'Verificado' ? new Date() : null;

      const updateRes = await query(
        `UPDATE tarjetas 
         SET estado = $1, fecha_culminacion = COALESCE($2, fecha_culminacion)
         WHERE id = $3 
         RETURNING id, nombre, descripcion, checklist, estado, tablero_id, fecha_inicio, fecha_vencimiento, fecha_culminacion`,
        [nuevoEstado, fechaCulminacion, tid]
      );

      // Nota: Si el trigger trg_auditoria_estado_tarjetas está en la BD, la inserción en historial_tarjetas
      // ocurrirá automáticamente de forma atómica e inmutable.
      return {
        ...updateRes.rows[0],
        titulo: updateRes.rows[0].nombre,
        estado_anterior: estadoAnterior
      };
    } else {
      const tarjeta = memoryStore.tarjetas.find(t => t.id === tid);
      if (!tarjeta) {
        const error = new Error('Compromiso no encontrado');
        error.statusCode = 404;
        throw error;
      }

      const estadoAnterior = tarjeta.estado;
      tarjeta.estado = nuevoEstado;
      tarjeta.actualizado_en = new Date();
      if (nuevoEstado === 'Verificado') {
        tarjeta.fecha_culminacion = new Date().toISOString();
      }

      // Registro inmutable de auditoría (emulando trigger trg_auditoria_estado_tarjetas)
      if (estadoAnterior !== nuevoEstado) {
        memoryStore.historial.push({
          id: memoryStore.historialIdSeq++,
          tarjeta_id: tid,
          estado_anterior: estadoAnterior,
          estado_nuevo: nuevoEstado,
          descripcion: motivo || `Cambio de estado: ${estadoAnterior} -> ${nuevoEstado}`,
          fecha: new Date(),
          fecha_cambio: new Date()
        });
      }

      return {
        ...tarjeta,
        titulo: tarjeta.nombre || tarjeta.titulo,
        estado_anterior: estadoAnterior
      };
    }
  }

  static async actualizarChecklist(id, checklist) {
    const tid = parseInt(id, 10);
    const validList = Array.isArray(checklist) ? checklist : [];

    if (usePostgres) {
      const res = await query(
        `UPDATE tarjetas 
         SET checklist = $1 
         WHERE id = $2 
         RETURNING id, nombre, descripcion, checklist, estado, tablero_id, fecha_inicio, fecha_vencimiento, fecha_culminacion`,
        [JSON.stringify(validList), tid]
      );
      if (res.rows.length === 0) {
        const error = new Error('Compromiso no encontrado');
        error.statusCode = 404;
        throw error;
      }
      return { ...res.rows[0], titulo: res.rows[0].nombre };
    } else {
      const tarjeta = memoryStore.tarjetas.find(t => t.id === tid);
      if (!tarjeta) {
        const error = new Error('Compromiso no encontrado');
        error.statusCode = 404;
        throw error;
      }
      tarjeta.checklist = validList;
      tarjeta.actualizado_en = new Date();
      return { ...tarjeta, titulo: tarjeta.nombre || tarjeta.titulo };
    }
  }

  static async eliminar(id) {
    const tid = parseInt(id, 10);
    if (usePostgres) {
      const res = await query('DELETE FROM tarjetas WHERE id = $1 RETURNING id', [tid]);
      return res.rows.length > 0;
    } else {
      const index = memoryStore.tarjetas.findIndex(t => t.id === tid);
      if (index === -1) return false;
      memoryStore.tarjetas.splice(index, 1);
      memoryStore.historial = memoryStore.historial.filter(h => h.tarjeta_id !== tid);
      return true;
    }
  }
}
