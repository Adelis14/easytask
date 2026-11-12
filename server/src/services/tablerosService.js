import { query, usePostgres, memoryStore } from '../config/db.js';

export class TablerosService {
  static async listarPorUsuario(usuarioId) {
    if (usePostgres) {
      const res = await query(
        `SELECT id, nombre, id_usuario, fecha_creacion
         FROM tableros
         WHERE id_usuario = $1
         ORDER BY fecha_creacion DESC`,
        [usuarioId]
      );
      return res.rows;
    } else {
      return memoryStore.tableros.filter(
        t => t.id_usuario === usuarioId || t.usuario_id === usuarioId
      );
    }
  }

  static async obtenerPorId(id, usuarioId) {
    if (usePostgres) {
      const res = await query(
        `SELECT id, nombre, id_usuario, fecha_creacion
         FROM tableros
         WHERE id = $1 AND id_usuario = $2`,
        [id, usuarioId]
      );
      return res.rows[0] || null;
    } else {
      return memoryStore.tableros.find(
        t => t.id === parseInt(id, 10) && (t.id_usuario === usuarioId || t.usuario_id === usuarioId)
      ) || null;
    }
  }

  static async crear({ nombre, usuarioId }) {
    if (usePostgres) {
      const res = await query(
        `INSERT INTO tableros (nombre, id_usuario)
         VALUES ($1, $2)
         RETURNING id, nombre, id_usuario, fecha_creacion`,
        [nombre, usuarioId]
      );
      return res.rows[0];
    } else {
      const nuevoTablero = {
        id: memoryStore.tableroIdSeq++,
        id_usuario: usuarioId,
        usuario_id: usuarioId,
        nombre,
        fecha_creacion: new Date(),
        creado_en: new Date()
      };
      memoryStore.tableros.push(nuevoTablero);
      return nuevoTablero;
    }
  }

  static async eliminar(id, usuarioId) {
    if (usePostgres) {
      const res = await query(
        'DELETE FROM tableros WHERE id = $1 AND id_usuario = $2 RETURNING id',
        [id, usuarioId]
      );
      return res.rows.length > 0;
    } else {
      const index = memoryStore.tableros.findIndex(
        t => t.id === parseInt(id, 10) && (t.id_usuario === usuarioId || t.usuario_id === usuarioId)
      );
      if (index === -1) return false;
      memoryStore.tableros.splice(index, 1);
      // Eliminar en cascada las tarjetas asociadas
      memoryStore.tarjetas = memoryStore.tarjetas.filter(t => t.tablero_id !== parseInt(id, 10));
      return true;
    }
  }
}
