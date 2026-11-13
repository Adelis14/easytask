import app from './app.js';
import { config } from './config/env.js';
import sequelize from './models/index.js';
// Importar modelos para que Sequelize los registre en el orden correcto
import Usuario from './models/Usuario.js';
import Tablero from './models/Tablero.js';
import Tarjeta from './models/Tarjeta.js';
import HistorialTarjeta from './models/HistorialTarjeta.js';
import bcrypt from 'bcryptjs';

async function seedDemoUser() {
  try {
    const existe = await Usuario.findOne({ where: { email: 'demo@easytask.org' } });
    if (!existe) {
      const hash = await bcrypt.hash('secreto123', 10);
      const demo = await Usuario.create({
        nombre: 'Líder de Equipo',
        apellido: 'Admin',
        usuario: 'lider_demo',
        email: 'demo@easytask.org',
        telefono: '+58 412 0000000',
        password: hash
      });

      // Crear minuta demo
      const minuta = await Tablero.create({
        nombre: 'Minuta: Sincronización Estratégica Q4',
        descripcion: 'Reunión ejecutiva de cierre de año.',
        id_usuario: demo.id,
        fecha_reunion: new Date()
      });

      // Crear compromisos de demostración
      const hoy = new Date();
      const addDays = (n) => { const d = new Date(hoy); d.setDate(hoy.getDate() + n); return d; };

      await Tarjeta.bulkCreate([
        {
          tablero_id: minuta.id,
          nombre: 'Auditoría de Requerimientos de Infraestructura Cloud',
          descripcion: 'Validar dimensionamiento de servidores y acuerdos de soporte para SLA 99.9%.',
          checklist: [{ id: 1, text: 'Inventario de nodos cloud', completed: true }, { id: 2, text: 'Revisión con equipo DevOps', completed: false }],
          estado: 'Pendiente', responsable: 'Carlos Mendoza',
          fecha_inicio: hoy, fecha_vencimiento: addDays(-3), creado_en: hoy, actualizado_en: hoy
        },
        {
          tablero_id: minuta.id,
          nombre: 'Migración del Pool de Conexiones a PostgreSQL',
          descripcion: 'Garantizar latencias de respuesta menores a 1.2s en consultas concurrentes.',
          checklist: [{ id: 1, text: 'Configurar variables de entorno', completed: true }, { id: 2, text: 'Pruebas de estrés', completed: false }],
          estado: 'En Proceso', responsable: 'Valeria Soto',
          fecha_inicio: hoy, fecha_vencimiento: addDays(1), creado_en: hoy, actualizado_en: hoy
        },
        {
          tablero_id: minuta.id,
          nombre: 'Diseño de la Arquitectura de Microservicios',
          descripcion: 'Documento técnico de especificación listo para aprobación de directores.',
          checklist: [{ id: 1, text: 'Diagramas C4', completed: true }, { id: 2, text: 'Contratos OpenAPI', completed: true }],
          estado: 'Entregado', responsable: 'Carlos Mendoza',
          fecha_inicio: hoy, fecha_vencimiento: addDays(5), creado_en: hoy, actualizado_en: hoy
        },
        {
          tablero_id: minuta.id,
          nombre: 'Puesta en Marcha de la Base de Datos Transaccional',
          descripcion: 'Instalación de PostgreSQL con triggers de auditoría.',
          checklist: [{ id: 1, text: 'Creación de tablas DDL', completed: true }, { id: 2, text: 'Trigger PL/pgSQL activo', completed: true }],
          estado: 'Verificado', responsable: 'Valeria Soto',
          fecha_inicio: hoy, fecha_vencimiento: addDays(10), fecha_culminacion: hoy, creado_en: hoy, actualizado_en: hoy
        }
      ]);

      console.log('✅ [SEED] Usuario demo y datos de ejemplo creados correctamente.');
    }
  } catch (err) {
    console.warn('⚠️  [SEED] No se pudieron crear datos de demo:', err.message);
  }
}

async function bootstrap() {
  try {
    // 1. Autenticar conexión Sequelize
    await sequelize.authenticate();
    console.log('✅ [SEQUELIZE] Conexión a PostgreSQL establecida.');

    // 2. Sincronizar modelos → crea tablas si no existen, ajusta columnas
    await sequelize.sync({ alter: true });
    console.log('✅ [SEQUELIZE] Tablas sincronizadas con la base de datos.');

    // 3. Insertar datos de demo si la BD está vacía
    await seedDemoUser();

  } catch (err) {
    console.error('❌ [SEQUELIZE] Error al conectar con la BD:', err.message);
    console.warn('⚠️  El servidor arrancará sin persistencia de datos.');
  }

  // 4. Iniciar servidor Express
  const server = app.listen(config.port, () => {
    console.log('====================================================');
    console.log(`🚀 EasyTask iniciado en el puerto ${config.port}`);
    console.log(`⏱️  SLA garantizado: < ${config.slaLimitMs}ms`);
    console.log(`🔗 API: http://localhost:${config.port}/api`);
    console.log('====================================================');
  });

  process.on('SIGTERM', () => {
    console.log('Cerrando servidor EasyTask ordenadamente...');
    server.close(() => {
      sequelize.close();
      process.exit(0);
    });
  });
}

bootstrap();
