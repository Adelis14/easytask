import { query, usePostgres, memoryStore } from '../config/db.js';
import { ESTADOS_VALIDOS } from '../config/constants.js';
import { calcularSemaforo } from '../utils/semaforo.js';

export class CompromisosController {
  /**
   * POST /api/compromisos
   * Crea un nuevo compromiso formalizado en la minuta de una reunión.
   * Valida campos obligatorios: tablero_id, titulo/nombre, fecha_vencimiento.
   * Inserta checklist como JSONB ('[]' por defecto) y estado inicial 'Pendiente'.
   */
  static async crearCompromiso(req, res) {
    try {
      const {
        tablero_id,
        nombre,
        titulo,
        descripcion = '',
        checklist = [],
        fecha_vencimiento,
        fecha_inicio = null,
        responsable = ''
      } = req.body;

      // Validación de campos obligatorios según especificación
      const nombreCompromiso = nombre || titulo;

      if (!tablero_id) {
        return res.status(400).json({
          error: 'El campo tablero_id es obligatorio para asociar el compromiso a una minuta.'
        });
      }

      if (!nombreCompromiso || !nombreCompromiso.trim()) {
        return res.status(400).json({
          error: 'El título o nombre del compromiso es obligatorio.'
        });
      }

      if (!fecha_vencimiento) {
        return res.status(400).json({
          error: 'La fecha_vencimiento es obligatoria para establecer el acuerdo en la minuta.'
        });
      }

      const tableroIdParsed = parseInt(tablero_id, 10);
      const listaChecklist = Array.isArray(checklist) ? checklist : [];
      const checklistJson = JSON.stringify(listaChecklist);
      const estadoInicial = 'Pendiente';
      const fechaInicioFinal = fecha_inicio || new Date();

      if (usePostgres) {
        // Verificar que la minuta (tablero) exista
        const checkTablero = await query(
          'SELECT id, nombre FROM tableros WHERE id = $1',
          [tableroIdParsed]
        );

        if (checkTablero.rows.length === 0) {
          return res.status(404).json({
            error: 'La minuta especificada no fue encontrada para registrar este compromiso.'
          });
        }

        const insertSql = `
          INSERT INTO tarjetas (
            tablero_id,
            nombre,
            descripcion,
            checklist,
            estado,
            fecha_inicio,
            fecha_vencimiento
          )
          VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)
          RETURNING id, tablero_id, nombre, descripcion, checklist, estado, fecha_inicio, fecha_vencimiento, fecha_culminacion
        `;

        const params = [
          tableroIdParsed,
          nombreCompromiso.trim(),
          descripcion.trim(),
          checklistJson,
          estadoInicial,
          fechaInicioFinal,
          fecha_vencimiento
        ];

        const resultado = await query(insertSql, params);
        const compromisoCreado = resultado.rows[0];

        // Inyectar semáforo dinámico
        const semaforo = calcularSemaforo(compromisoCreado.fecha_vencimiento);

        return res.status(201).json({
          mensaje: 'Compromiso registrado exitosamente en la minuta de la reunión.',
          compromiso: {
            ...compromisoCreado,
            titulo: compromisoCreado.nombre,
            semaforo
          }
        });
      } else {
        // Almacenamiento en memoria para modo desarrollo / demostración
        const tableroExiste = memoryStore.tableros.some(t => t.id === tableroIdParsed);
        if (!tableroExiste) {
          return res.status(404).json({
            error: 'La minuta especificada no fue encontrada para registrar este compromiso.'
          });
        }

        const nuevoCompromiso = {
          id: memoryStore.tarjetaIdSeq++,
          tablero_id: tableroIdParsed,
          nombre: nombreCompromiso.trim(),
          titulo: nombreCompromiso.trim(),
          descripcion: descripcion.trim(),
          checklist: listaChecklist,
          estado: estadoInicial,
          responsable,
          fecha_inicio: fechaInicioFinal,
          fecha_vencimiento,
          fecha_culminacion: null,
          creado_en: new Date(),
          actualizado_en: new Date()
        };

        memoryStore.tarjetas.push(nuevoCompromiso);

        // Registro de auditoría inicial
        memoryStore.historial.push({
          id: memoryStore.historialIdSeq++,
          tarjeta_id: nuevoCompromiso.id,
          estado_anterior: null,
          estado_nuevo: estadoInicial,
          descripcion: 'Compromiso creado en la minuta de la reunión',
          fecha: new Date()
        });

        const semaforo = calcularSemaforo(nuevoCompromiso.fecha_vencimiento);

        return res.status(201).json({
          mensaje: 'Compromiso registrado exitosamente en la minuta de la reunión.',
          compromiso: {
            ...nuevoCompromiso,
            semaforo
          }
        });
      }
    } catch (error) {
      console.error('[COMPROMISOS ERROR - CREAR]', error);
      return res.status(500).json({
        error: 'Error interno al registrar el compromiso en la minuta.',
        detalle: error.message
      });
    }
  }

  /**
   * PUT /api/compromisos/:id/estado
   * Actualiza el estado de un compromiso validando estrictamente los 4 estados permitidos:
   * 'Pendiente', 'En Proceso', 'Entregado', 'Verificado'
   */
  static async actualizarEstado(req, res) {
    try {
      const { id } = req.params;
      const { nuevo_estado, estado, motivo = '' } = req.body;

      const estadoSolicitado = nuevo_estado || estado;

      if (!estadoSolicitado) {
        return res.status(400).json({
          error: 'El campo nuevo_estado es requerido para actualizar el compromiso.'
        });
      }

      // Validación estricta contra los 4 estados canónicos del dominio
      if (!ESTADOS_VALIDOS.includes(estadoSolicitado)) {
        return res.status(400).json({
          error: `Estado inválido para el compromiso. Los estados permitidos son estrictamente: ${ESTADOS_VALIDOS.join(', ')}.`
        });
      }

      const compromisoId = parseInt(id, 10);

      if (usePostgres) {
        // Verificar existencia previa del compromiso
        const checkSql = 'SELECT id, estado, fecha_culminacion FROM tarjetas WHERE id = $1';
        const checkRes = await query(checkSql, [compromisoId]);

        if (checkRes.rows.length === 0) {
          return res.status(404).json({
            error: 'El compromiso solicitado no fue encontrado en las minutas del sistema.'
          });
        }

        const estadoAnterior = checkRes.rows[0].estado;
        const fechaCulminacion = estadoSolicitado === 'Verificado' ? new Date() : null;

        const updateSql = `
          UPDATE tarjetas
          SET estado = $1,
              fecha_culminacion = CASE 
                WHEN $1 = 'Verificado' THEN CURRENT_TIMESTAMP 
                ELSE fecha_culminacion 
              END
          WHERE id = $2
          RETURNING id, tablero_id, nombre, descripcion, checklist, estado, fecha_inicio, fecha_vencimiento, fecha_culminacion
        `;

        const updateRes = await query(updateSql, [estadoSolicitado, compromisoId]);
        const compromisoActualizado = updateRes.rows[0];

        // Inyectar semáforo
        const semaforo = calcularSemaforo(compromisoActualizado.fecha_vencimiento);

        return res.status(200).json({
          mensaje: 'Estado del compromiso actualizado con éxito en la minuta.',
          estado_anterior: estadoAnterior,
          estado_nuevo: estadoSolicitado,
          compromiso: {
            ...compromisoActualizado,
            titulo: compromisoActualizado.nombre,
            semaforo
          }
        });
      } else {
        const compromiso = memoryStore.tarjetas.find(t => t.id === compromisoId);

        if (!compromiso) {
          return res.status(404).json({
            error: 'El compromiso solicitado no fue encontrado en las minutas del sistema.'
          });
        }

        const estadoAnterior = compromiso.estado;
        compromiso.estado = estadoSolicitado;
        compromiso.actualizado_en = new Date();

        if (estadoSolicitado === 'Verificado') {
          compromiso.fecha_culminacion = new Date().toISOString();
        }

        // Auditoría inmutable de la transición de acuerdos
        if (estadoAnterior !== estadoSolicitado) {
          memoryStore.historial.push({
            id: memoryStore.historialIdSeq++,
            tarjeta_id: compromisoId,
            estado_anterior: estadoAnterior,
            estado_nuevo: estadoSolicitado,
            descripcion: motivo || `Transición de acuerdo: ${estadoAnterior} -> ${estadoSolicitado}`,
            fecha: new Date()
          });
        }

        const semaforo = calcularSemaforo(compromiso.fecha_vencimiento);

        return res.status(200).json({
          mensaje: 'Estado del compromiso actualizado con éxito en la minuta.',
          estado_anterior: estadoAnterior,
          estado_nuevo: estadoSolicitado,
          compromiso: {
            ...compromiso,
            titulo: compromiso.nombre || compromiso.titulo,
            semaforo
          }
        });
      }
    } catch (error) {
      console.error('[COMPROMISOS ERROR - ACTUALIZAR ESTADO]', error);
      return res.status(500).json({
        error: 'Error interno al actualizar el estado del compromiso.',
        detalle: error.message
      });
    }
  }

  /**
   * GET /api/tableros/:id/compromisos
   * Obtiene todos los compromisos acordados en una minuta e inyecta dinámicamente
   * la propiedad 'semaforo' calculada en cada uno.
   */
  static async obtenerPorTablero(req, res) {
    try {
      const { id } = req.params;
      const tableroIdParsed = parseInt(id, 10);

      if (isNaN(tableroIdParsed)) {
        return res.status(400).json({
          error: 'Identificador de minuta inválido.'
        });
      }

      if (usePostgres) {
        // Validar que la minuta existe
        const checkTablero = await query(
          'SELECT id, nombre FROM tableros WHERE id = $1',
          [tableroIdParsed]
        );

        if (checkTablero.rows.length === 0) {
          return res.status(404).json({
            error: 'La minuta especificada no existe en el sistema.'
          });
        }

        const selectSql = `
          SELECT id, tablero_id, nombre, descripcion, checklist, estado, fecha_inicio, fecha_vencimiento, fecha_culminacion
          FROM tarjetas
          WHERE tablero_id = $1
          ORDER BY id ASC
        `;

        const resultado = await query(selectSql, [tableroIdParsed]);

        // Inyectar dinámicamente la propiedad 'semaforo' usando calcularSemaforo
        const compromisosConSemaforo = resultado.rows.map((fila) => ({
          ...fila,
          titulo: fila.nombre,
          semaforo: calcularSemaforo(fila.fecha_vencimiento)
        }));

        return res.status(200).json({
          minuta_id: tableroIdParsed,
          minuta_nombre: checkTablero.rows[0].nombre,
          total_compromisos: compromisosConSemaforo.length,
          compromisos: compromisosConSemaforo
        });
      } else {
        const tablero = memoryStore.tableros.find(t => t.id === tableroIdParsed);

        if (!tablero) {
          return res.status(404).json({
            error: 'La minuta especificada no existe en el sistema.'
          });
        }

        const compromisos = memoryStore.tarjetas.filter(t => t.tablero_id === tableroIdParsed);

        // Inyectar dinámicamente el semáforo en cada compromiso
        const compromisosConSemaforo = compromisos.map((t) => ({
          ...t,
          titulo: t.nombre || t.titulo,
          semaforo: calcularSemaforo(t.fecha_vencimiento)
        }));

        return res.status(200).json({
          minuta_id: tableroIdParsed,
          minuta_nombre: tablero.nombre,
          total_compromisos: compromisosConSemaforo.length,
          compromisos: compromisosConSemaforo
        });
      }
    } catch (error) {
      console.error('[COMPROMISOS ERROR - LISTAR POR MINUTA]', error);
      return res.status(500).json({
        error: 'Error interno al consultar los compromisos de la minuta.',
        detalle: error.message
      });
    }
  }
}
