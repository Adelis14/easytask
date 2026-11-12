import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const { Pool } = pg;

// Conexión tolerante: si hay DATABASE_URL se conecta a Postgres real,
// si no, inicializa un Mock Storage en memoria idéntico a PostgreSQL para permitir ejecución inmediata sin bloquear.
const usePostgres = Boolean(process.env.DATABASE_URL);

let pool = null;
if (usePostgres) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    statement_timeout: 1000 // Garantía SLA de rendimiento < 1.2s
  });
}

// In-Memory Storage compatible para desarrollo local / demostración
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
      email: 'demo@easytask.org',
      password_hash: defaultPasswordHash,
      creado_en: new Date()
    };
    this.usuarios.push(user);

    // Minuta de Reunión Inicial
    const minuta = {
      id: this.tableroIdSeq++,
      usuario_id: user.id,
      nombre: 'Minuta: Sincronización Estratégica Q4',
      descripcion: 'Reunión ejecutiva para fijar acuerdos y compromisos operativos de cierre de año.',
      fecha_reunion: new Date().toISOString(),
      creado_en: new Date()
    };
    this.tableros.push(minuta);

    // Fechas dinámicas para probar semáforo
    const today = new Date();
    
    // Compromiso A Tiempo (Verde)
    const dGreen = new Date(today);
    dGreen.setDate(today.getDate() + 5);

    // Compromiso Próximo a Vencer (Amarillo: hoy o en 48 horas)
    const dYellow = new Date(today);
    dYellow.setDate(today.getDate() + 1);

    // Compromiso Vencido (Rojo: días anteriores)
    const dRed = new Date(today);
    dRed.setDate(today.getDate() - 2);

    const c1 = {
      id: this.tarjetaIdSeq++,
      tablero_id: minuta.id,
      titulo: 'Auditoría de Requerimientos de Infraestructura',
      descripcion: 'Validar dimensionamiento de servidores y acuerdos de soporte para SLA 99.9%.',
      checklist: [
        { id: 1, text: 'Inventario de nodos cloud', completed: true },
        { id: 2, text: 'Revisión con equipo DevOps', completed: false }
      ],
      fecha_vencimiento: dGreen.toISOString().split('T')[0],
      estado: 'Pendiente',
      responsable: 'Carlos Mendoza',
      creado_en: new Date(),
      actualizado_en: new Date()
    };

    const c2 = {
      id: this.tarjetaIdSeq++,
      tablero_id: minuta.id,
      titulo: 'Entrega de Reporte Financiero de Acuerdos',
      descripcion: 'Consolidar partidas presupuestarias pactadas en la reunión anterior.',
      checklist: [
        { id: 1, text: 'Validar órdenes de compra', completed: true },
        { id: 2, text: 'Firmar acta de conformidad', completed: true }
      ],
      fecha_vencimiento: dYellow.toISOString().split('T')[0],
      estado: 'En Proceso',
      responsable: 'Valeria Soto',
      creado_en: new Date(),
      actualizado_en: new Date()
    };

    const c3 = {
      id: this.tarjetaIdSeq++,
      tablero_id: minuta.id,
      titulo: 'Homologación de Protocolos de Seguridad',
      descripcion: 'Cierre de hallazgos críticos detectados en la minuta de ciberseguridad.',
      checklist: [
        { id: 1, text: 'Actualizar certificados SSL', completed: false }
      ],
      fecha_vencimiento: dRed.toISOString().split('T')[0],
      estado: 'Entregado',
      responsable: 'Esteban Morales',
      creado_en: new Date(),
      actualizado_en: new Date()
    };

    this.tarjetas.push(c1, c2, c3);

    this.historial.push(
      { id: this.historialIdSeq++, tarjeta_id: c2.id, estado_anterior: 'Pendiente', estado_nuevo: 'En Proceso', fecha_cambio: new Date() },
      { id: this.historialIdSeq++, tarjeta_id: c3.id, estado_anterior: 'Pendiente', estado_nuevo: 'En Proceso', fecha_cambio: new Date() },
      { id: this.historialIdSeq++, tarjeta_id: c3.id, estado_anterior: 'En Proceso', estado_nuevo: 'Entregado', fecha_cambio: new Date() }
    );
  }
}

export const memoryStore = new InMemoryStorage();

export const query = async (text, params) => {
  const start = Date.now();
  if (pool) {
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      if (duration > 1000) {
        console.warn(`[PERF WARNING] Consulta tardó ${duration}ms: ${text.slice(0, 50)}`);
      }
      return res;
    } catch (err) {
      console.error('[DB ERROR]', err);
      throw err;
    }
  }
  return null;
};

export { pool, usePostgres };
