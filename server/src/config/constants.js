// ====================================================================
// Reglas de Dominio Estricto (UI-REQ-01 / UI-REQ-01.4)
// Prohibido el uso de "Tareas" o "Proyectos"
// Nomenclatura obligatoria: "Reuniones", "Minutas" y "Compromisos"
// ====================================================================

export const ESTADOS_VALIDOS = ['Pendiente', 'En Proceso', 'Entregado', 'Verificado'];

export const TRANSICIONES_PERMITIDAS = {
  'Pendiente': ['En Proceso'],
  'En Proceso': ['Entregado', 'Pendiente'],
  'Entregado': ['Verificado', 'En Proceso'],
  'Verificado': []
};

export const SLA_MAX_MS = 1200;
