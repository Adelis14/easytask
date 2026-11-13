// ====================================================================
// Sistema de Tareas basado en Semáforos:
// Rojo: Iniciado / Urgente
// Amarillo: En Proceso
// Verde: Listo / Completado
// ====================================================================

export const ESTADOS_VALIDOS = [
  'Iniciado',
  'Pendiente',
  'En Proceso',
  'Listo',
  'Entregado',
  'Verificado'
];

export const TRANSICIONES_PERMITIDAS = {
  'Iniciado': ['En Proceso', 'Listo'],
  'Pendiente': ['En Proceso', 'Listo'],
  'En Proceso': ['Listo', 'Iniciado', 'Pendiente'],
  'Listo': ['En Proceso', 'Iniciado'],
  'Entregado': ['Verificado', 'Listo', 'En Proceso'],
  'Verificado': ['En Proceso']
};

export const SLA_MAX_MS = 1200;
