import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================================');
console.log('🚀 Iniciando EasyTask en entorno local...');
console.log('📡 Servidor Backend: http://localhost:5000/api');
console.log('💻 Cliente Frontend: http://localhost:3000');
console.log('====================================================');

const serverProc = spawn('node', ['src/index.js'], {
  cwd: path.resolve(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

const clientProc = spawn('npm', ['run', 'dev'], {
  cwd: path.resolve(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

const limpiar = () => {
  console.log('\n🛑 Deteniendo EasyTask...');
  try {
    serverProc.kill();
  } catch {}
  try {
    clientProc.kill();
  } catch {}
  process.exit(0);
};

process.on('SIGINT', limpiar);
process.on('SIGTERM', limpiar);
process.on('exit', limpiar);

