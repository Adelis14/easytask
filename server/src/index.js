import app from './app.js';
import { config } from './config/env.js';
import { testDatabaseConnection, usePostgres } from './config/db.js';

async function bootstrap() {
  // Probar conexión al pool de PostgreSQL configurado en .env
  await testDatabaseConnection();

  const server = app.listen(config.port, () => {
    console.log('====================================================');
    console.log(`🚀 Servidor EasyTask iniciado en el puerto ${config.port}`);
    console.log(`⏱️ SLA de Respuesta garantizado: < ${config.slaLimitMs}ms`);
    console.log(`💾 Motor de Datos: ${usePostgres ? 'PostgreSQL (pg.Pool)' : 'In-Memory Mock Storage (SLA ready)'}`);
    console.log(`🔒 Dominio Estricto: Reuniones, Minutas y Compromisos`);
    console.log('====================================================');
  });

  // Manejo de señales de terminación para cierre ordenado
  process.on('SIGTERM', () => {
    console.log('Cerrando servidor EasyTask ordenadamente...');
    server.close(() => {
      console.log('Servidor finalizado.');
      process.exit(0);
    });
  });
}

bootstrap();
