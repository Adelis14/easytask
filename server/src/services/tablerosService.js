import Tablero from '../models/Tablero.js';

export class TablerosService {
  static async listarPorUsuario(usuarioId) {
    return Tablero.findAll({
      where: { id_usuario: usuarioId },
      order: [['fecha_creacion', 'DESC']]
    });
  }

  static async listarTodos() {
    return Tablero.findAll({ order: [['fecha_creacion', 'DESC']] });
  }

  static async obtenerPorId(id, usuarioId) {
    const where = { id: parseInt(id, 10) };
    if (usuarioId) where.id_usuario = usuarioId;
    return Tablero.findOne({ where }) || null;
  }

  static async crear({ nombre, descripcion = '', fecha_reunion = null, usuarioId }) {
    return Tablero.create({
      nombre,
      descripcion,
      fecha_reunion: fecha_reunion || new Date(),
      id_usuario: usuarioId
    });
  }

  static async eliminar(id, usuarioId) {
    const where = { id: parseInt(id, 10) };
    if (usuarioId) where.id_usuario = usuarioId;
    const rows = await Tablero.destroy({ where });
    return rows > 0;
  }
}
