import pg from 'pg';
import bcrypt from 'bcryptjs';
import { config } from './env.js';

const { Pool } = pg;

// ====================================================================
// Configuración del Pool de Conexiones PostgreSQL con 'pg'
// Optimizado para cumplimiento estricto del SLA (< 1.2s)
// ====================================================================

const poolConfig = config.db.connectionString
  ? {
      connectionString: config.db.connectionString,
      ssl: config.db.ssl,
      max: config.db.max,
      idleTimeoutMillis: config.db.idleTimeoutMillis,
      connectionTimeoutMillis: config.db.connectionTimeoutMillis,
      statement_timeout: config.db.statement_timeout
    }
  : {
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      ssl: config.db.ssl,
      max: config.db.max, // Máximo 20 clientes concurrentes
      idleTimeoutMillis: config.db.idleTimeoutMillis, // 30s antes de cerrar clientes inactivos
      connectionTimeoutMillis: config.db.connectionTimeoutMillis, // 2s timeout de conexión
      statement_timeout: config.db.statement_timeout // 1000ms SLA guardrail
    };

export const pool = new Pool(poolConfig);

// Eventos de monitoreo del Pool
pool.on('connect', (client) => {
  // Configuración de zona horaria o parámetros de sesión si es necesario
});

pool.on('error', (err, client) => {
  console.error('[POSTGRES POOL ERROR] Error inesperado en un cliente inactivo del pool:', err.message);
});

// Bandera reactiva para determinar si Postgres está activo o se usa fallback in-memory
export let usePostgres = false;

/**
 * Función para probar la conectividad real con PostgreSQL al iniciar el backend
 */
export const testDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() as now, current_database() as db');
    client.release();
    usePostgres = true;
    console.log(`✅ [POSTGRESQL] Conexión establecida exitosamente a '${res.rows[0].db}' (${res.rows[0].now})`);
    return true;
  } catch (err) {
    usePostgres = false;
    console.warn(`⚠️ [POSTGRESQL OFFLINE] No se pudo conectar a la BD (${err.message}). Activando almacenamiento simulado en memoria para mantener operatividad del SLA.`);
    return false;
  }
};

/**
 * Ejecuta una consulta SQL en el pool con medición de tiempo para cumplimiento de SLA (< 1.2s)
 * @param {string} text - Consulta SQL parametrizada
 * @param {Array} params - Parámetros de la consulta
 */
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > config.db.statement_timeout) {
      console.warn(`⚠️ [PERF WARNING] Consulta SQL lenta (${duration}ms > ${config.db.statement_timeout}ms): ${text.slice(0, 80)}...`);
    }
    return res;
  } catch (err) {
    console.error('[DB QUERY ERROR]', { query: text.slice(0, 100), error: err.message });
    throw err;
  }
};

// ====================================================================
// In-Memory Storage para demostración y desarrollo si Postgres está apagado
// ====================================================================
class InMemoryStorage {
  constructor() {
    this.usuarios = [];
    this.tableros = [];
    this.tarjetas = [];
    this.historial = [];
    this.userIdSeq = 1;
    this.tableroIdSeq = 1;
    this.tarjetaIdSeq = 1;
    this.historialIdSeq = 1;

    this.seedDefaultData();
  }

  async seedDefaultData() {
    const defaultPasswordHash = await bcrypt.hash('secreto123', 10);
    const user = {
      id: this.userIdSeq++,
      nombre: 'Líder de Equipo',
      apellido: 'Admin',
      usuario: 'lider_demo',
      email: 'demo@easytask.org',
      telefono: '+58 412 0000000',
      password: defaultPasswordHash,
      password_hash: defaultPasswordHash,
      fecha_creacion: new Date(),
      creado_en: new Date()
    };
    this.usuarios.push(user);

    const minuta = {
      id: this.tableroIdSeq++,
      id_usuario: user.id,
      usuario_id: user.id,
      nombre: 'Minuta: Sincronización Estratégica Q4',
      descripcion: 'Reunión ejecutiva para fijar acuerdos y compromisos operativos de cierre de año.',
      fecha_reunion: new Date().toISOString(),
      fecha_creacion: new Date(),
      creado_en: new Date()
    };
    this.tableros.push(minuta);

    const today = new Date();
    const addDays = (d) => {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      return date.toISOString().split('T')[0];
    };

    // 10 compromisos con semaforización (rojo, amarillo, verde) en los 4 estados canónicos
    const compromisosSemilla = [
      // ── PENDIENTE ─────────────────────────────────────────────────────────
      {
        id: this.tarjetaIdSeq++,
        tablero_id: minuta.id,
        nombre: 'Auditoría de Requerimientos de Infraestructura Cloud',
        titulo: 'Auditoría de Requerimientos de Infraestructura Cloud',
        descripcion: 'Validar dimensionamiento de servidores y acuerdos de soporte para SLA 99.9%.',
        checklist: [
          { id: 1, text: 'Inventario de nodos cloud', completed: true },
          { id: 2, text: 'Revisión con equipo DevOps', completed: false },
          { id: 3, text: 'Aprobación de arquitectura', completed: false }
        ],
        fecha_inicio: new Date().toISOString(),
        fecha_vencimiento: addDays(-3), // Vencido -> ROJO
        fecha_culminacion: null,
        estado: 'Pendiente',
        responsable: 'Carlos Mendoza',
        creado_en: new Date(),
        actualizado_en: new Date()
      },
      {
        id: this.tarjetaIdSeq++,
        tablero_id: minuta.id,
        nombre: 'Redacción de Estatutos de Integración Continua',
        titulo: 'Redacción de Estatutos de Integración Continua',
        descripcion: 'Fijar lineamientos de despliegues pactados en la minuta de operaciones.',
        checklist: [
          { id: 1, text: 'Borrador preliminar', completed: true },
          { id: 2, text: 'Revisión de seguridad', completed: false }
        ],
        fecha_inicio: new Date().toISOString(),
        fecha_vencimiento: addDays(1), // Vence mañana -> AMARILLO
        fecha_culminacion: null,
        estado: 'Pendiente',
        responsable: 'Valeria Soto',
        creado_en: new Date(),
        actualizado_en: new Date()
      },
      {
        id: this.tarjetaIdSeq++,
        tablero_id: minuta.id,
        nombre: 'Plan de Capacitación en Acuerdos de Desempeño',
        titulo: 'Plan de Capacitación en Acuerdos de Desempeño',
        descripcion: 'Diseñar jornadas de inducción sobre el flujo de compromisos sin muerte por reunión.',
        checklist: [
          { id: 1, text: 'Temario del taller', completed: false },
          { id: 2, text: 'Convocatoria a líderes', completed: false }
        ],
        fecha_inicio: new Date().toISOString(),
        fecha_vencimiento: addDays(10), // A tiempo -> VERDE
        fecha_culminacion: null,
        estado: 'Pendiente',
        responsable: 'Esteban Morales',
        creado_en: new Date(),
        actualizado_en: new Date()
      },

      // ── EN PROCESO ────────────────────────────────────────────────────────
      {
        id: this.tarjetaIdSeq++,
        tablero_id: minuta.id,
        nombre: 'Renovación de Certificados SSL y Cifrado Bancario',
        titulo: 'Renovación de Certificados SSL y Cifrado Bancario',
        descripcion: 'Cierre urgente de observaciones de seguridad pactadas en la reunión anterior.',
        checklist: [
          { id: 1, text: 'Emisión de llaves CSR', completed: true },
          { id: 2, text: 'Despliegue en balanceador', completed: false }
        ],
        fecha_inicio: new Date().toISOString(),
        fecha_vencimiento: addDays(-2), // Vencido en proceso -> ROJO
        fecha_culminacion: null,
        estado: 'En Proceso',
        responsable: 'Carlos Mendoza',
        creado_en: new Date(),
        actualizado_en: new Date()
      },
      {
        id: this.tarjetaIdSeq++,
        tablero_id: minuta.id,
        nombre: 'Migración del Pool de Conexiones a PostgreSQL',
        titulo: 'Migración del Pool de Conexiones a PostgreSQL',
        descripcion: 'Garantizar latencias de respuesta menores a 1.2s en consultas concurrentes.',
        checklist: [
          { id: 1, text: 'Configurar variables de entorno', completed: true },
          { id: 2, text: 'Optimizar statement_timeout', completed: true },
          { id: 3, text: 'Pruebas de estrés de pool', completed: false }
        ],
        fecha_inicio: new Date().toISOString(),
        fecha_vencimiento: addDays(0), // Vence hoy -> AMARILLO
        fecha_culminacion: null,
        estado: 'En Proceso',
        responsable: 'Valeria Soto',
        creado_en: new Date(),
        actualizado_en: new Date()
      },
      {
        id: this.tarjetaIdSeq++,
        tablero_id: minuta.id,
        nombre: 'Desarrollo de Vistas Adaptables Móviles (RWD-4.1)',
        titulo: 'Desarrollo de Vistas Adaptables Móviles (RWD-4.1)',
        descripcion: 'Implementar acordeones en mobile y layouts a 4 columnas en desktop sin scroll horizontal.',
        checklist: [
          { id: 1, text: 'Grid de 4 columnas en desktop', completed: true },
          { id: 2, text: 'Acordeón táctil en mobile', completed: true },
          { id: 3, text: 'Validación WCAG de contraste', completed: true }
        ],
        fecha_inicio: new Date().toISOString(),
        fecha_vencimiento: addDays(8), // A tiempo -> VERDE
        fecha_culminacion: null,
        estado: 'En Proceso',
        responsable: 'Líder de Equipo',
        creado_en: new Date(),
        actualizado_en: new Date()
      },

      // ── ENTREGADO ─────────────────────────────────────────────────────────
      {
        id: this.tarjetaIdSeq++,
        tablero_id: minuta.id,
        nombre: 'Consolidación de Balances Financieros de Acuerdos',
        titulo: 'Consolidación de Balances Financieros de Acuerdos',
        descripcion: 'Entregable de auditoría financiera pactado en la minuta ordinaria mensual.',
        checklist: [
          { id: 1, text: 'Conciliación de partidas', completed: true },
          { id: 2, text: 'Firma de conformidad previa', completed: true }
        ],
        fecha_inicio: new Date().toISOString(),
        fecha_vencimiento: addDays(1), // Próximo a vencer -> AMARILLO
        fecha_culminacion: null,
        estado: 'Entregado',
        responsable: 'Esteban Morales',
        creado_en: new Date(),
        actualizado_en: new Date()
      },
      {
        id: this.tarjetaIdSeq++,
        tablero_id: minuta.id,
        nombre: 'Diseño de la Arquitectura de Microservicios',
        titulo: 'Diseño de la Arquitectura de Microservicios',
        descripcion: 'Documento técnico de especificación listo para aprobación de directores.',
        checklist: [
          { id: 1, text: 'Diagramas C4', completed: true },
          { id: 2, text: 'Definición de contratos OpenAPI', completed: true }
        ],
        fecha_inicio: new Date().toISOString(),
        fecha_vencimiento: addDays(12), // A tiempo -> VERDE
        fecha_culminacion: null,
        estado: 'Entregado',
        responsable: 'Carlos Mendoza',
        creado_en: new Date(),
        actualizado_en: new Date()
      },

      // ── VERIFICADO ────────────────────────────────────────────────────────
      {
        id: this.tarjetaIdSeq++,
        tablero_id: minuta.id,
        nombre: 'Puesta en Marcha de la Base de Datos Transaccional',
        titulo: 'Puesta en Marcha de la Base de Datos Transaccional',
        descripcion: 'Instalación de PostgreSQL con triggers de auditoría inmutables trg_auditoria_estado_tarjetas.',
        checklist: [
          { id: 1, text: 'Creación de tablas DDL', completed: true },
          { id: 2, text: 'Trigger PL/pgSQL activo', completed: true },
          { id: 3, text: 'Pruebas de integridad referencial', completed: true }
        ],
        fecha_inicio: new Date().toISOString(),
        fecha_vencimiento: addDays(15),
        fecha_culminacion: new Date().toISOString(),
        estado: 'Verificado',
        responsable: 'Valeria Soto',
        creado_en: new Date(),
        actualizado_en: new Date()
      },
      {
        id: this.tarjetaIdSeq++,
        tablero_id: minuta.id,
        nombre: 'Aprobación del Acta Constitutiva de Reuniones',
        titulo: 'Aprobación del Acta Constitutiva de Reuniones',
        descripcion: 'Erradicación de la muerte por reunión mediante la firma del manifiesto EasyTask.',
        checklist: [
          { id: 1, text: 'Redacción de cláusulas', completed: true },
          { id: 2, text: 'Votación unánime', completed: true }
        ],
        fecha_inicio: new Date().toISOString(),
        fecha_vencimiento: addDays(20),
        fecha_culminacion: new Date().toISOString(),
        estado: 'Verificado',
        responsable: 'Líder de Equipo',
        creado_en: new Date(),
        actualizado_en: new Date()
      }
    ];

    this.tarjetas.push(...compromisosSemilla);

    this.historial.push(
      { id: this.historialIdSeq++, tarjeta_id: 2, estado_anterior: 'Pendiente', estado_nuevo: 'En Proceso', descripcion: 'Cambio de estado: Pendiente -> En Proceso', fecha: new Date() },
      { id: this.historialIdSeq++, tarjeta_id: 4, estado_anterior: 'Pendiente', estado_nuevo: 'En Proceso', descripcion: 'Cambio de estado: Pendiente -> En Proceso', fecha: new Date() },
      { id: this.historialIdSeq++, tarjeta_id: 7, estado_anterior: 'En Proceso', estado_nuevo: 'Entregado', descripcion: 'Cambio de estado: En Proceso -> Entregado', fecha: new Date() },
      { id: this.historialIdSeq++, tarjeta_id: 9, estado_anterior: 'Entregado', estado_nuevo: 'Verificado', descripcion: 'Cambio de estado: Entregado -> Verificado', fecha: new Date() }
    );
  }
}

export const memoryStore = new InMemoryStorage();
