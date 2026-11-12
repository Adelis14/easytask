import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env específico del servidor y luego fallback en raíz
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'easytask_secret_key_reuniones_minutas_compromisos',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Configuración de PostgreSQL
  db: {
    connectionString: process.env.DATABASE_URL || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'easytask_db',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    
    // Parámetros de Rendimiento y SLA (< 1.2s)
    max: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '2000', 10),
    statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT_MS || '1000', 10) // 1000ms max query time
  },

  // Umbral SLA de la aplicación (1200ms)
  slaLimitMs: parseInt(process.env.SLA_LIMIT_MS || '1200', 10)
};
