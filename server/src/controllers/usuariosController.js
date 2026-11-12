import { query, usePostgres, memoryStore } from '../config/db.js';

export class UsuariosController {
  static async listar(req, res, next) {
    try {
      if (usePostgres) {
        const result = await query(
          `SELECT id, nombre, apellido, usuario, email, telefono, fecha_creacion
           FROM usuarios
           ORDER BY id ASC`
        );
        return res.status(200).json(result.rows);
      }

      // Base de usuarios en memoria para demo
      const lista = (memoryStore.usuarios || []).map(u => ({
        id: u.id,
        nombre: u.nombre,
        apellido: u.apellido,
        usuario: u.usuario,
        email: u.email,
        telefono: u.telefono,
        fecha_creacion: u.fecha_creacion || u.creado_en
      }));

      // Asegurar miembros clave del equipo para métricas
      const miembrosBase = [
        { id: 101, nombre: 'Carlos Mendoza', apellido: '', usuario: 'cmendoza', email: 'carlos.mendoza@easytask.org', telefono: '+58 412 1111111', rol: 'Especialista Cloud & DevOps' },
        { id: 102, nombre: 'Valeria Soto', apellido: '', usuario: 'vsoto', email: 'valeria.soto@easytask.org', telefono: '+58 414 2222222', rol: 'Analista Financiero & Presupuestos' },
        { id: 103, nombre: 'Esteban Morales', apellido: '', usuario: 'emorales', email: 'esteban.morales@easytask.org', telefono: '+58 416 3333333', rol: 'Auditor de Ciberseguridad' }
      ];

      const combinados = [...lista];
      miembrosBase.forEach(mb => {
        if (!combinados.some(u => u.nombre.toLowerCase().includes(mb.nombre.toLowerCase()))) {
          combinados.push({ ...mb, fecha_creacion: new Date() });
        }
      });

      return res.status(200).json(combinados);
    } catch (err) {
      next(err);
    }
  }
}
