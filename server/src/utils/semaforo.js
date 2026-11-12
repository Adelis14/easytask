// ====================================================================
// EasyTask: Algoritmo de Semáforo de Acuerdos (UI-REQ-01)
// Dominio: Reuniones, Minutas y Compromisos (UI-REQ-01.4)
// ====================================================================

/**
 * Calcula dinámicamente el estado del semáforo para un compromiso
 * basándose en su fecha de vencimiento y fecha actual.
 * - Verde: A tiempo (> 2 días restantes)
 * - Amarillo: En riesgo / Próximo a vencer (0 a 2 días restantes)
 * - Rojo: Vencido (< 0 días restantes)
 * 
 * @param {string|Date} fechaVencimiento - Fecha de vencimiento del compromiso
 * @returns {Object} Objeto con nivel, color, etiqueta y días restantes
 */
export const calcularSemaforo = (fechaVencimiento) => {
  if (!fechaVencimiento) {
    return {
      nivel: 'gris',
      color: '#64748b',
      etiqueta: 'Sin fecha de vencimiento pactada',
      dias_restantes: null,
      alerta_sla: false
    };
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  let fechaVenc;
  if (typeof fechaVencimiento === 'string' && fechaVencimiento.includes('T')) {
    fechaVenc = new Date(fechaVencimiento);
  } else if (typeof fechaVencimiento === 'string') {
    const [y, m, d] = fechaVencimiento.split(/[-/]/).map(Number);
    fechaVenc = new Date(y, m - 1, d);
  } else {
    fechaVenc = new Date(fechaVencimiento);
  }
  fechaVenc.setHours(0, 0, 0, 0);

  const diffMs = fechaVenc.getTime() - hoy.getTime();
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias < 0) {
    const diasVencido = Math.abs(diffDias);
    return {
      nivel: 'rojo',
      color: '#ef4444',
      etiqueta: diasVencido === 1 ? 'Compromiso vencido ayer' : `Compromiso vencido hace ${diasVencido} días`,
      dias_restantes: diffDias,
      alerta_sla: true
    };
  } else if (diffDias <= 2) {
    const etiqueta = diffDias === 0 
      ? 'Compromiso vence hoy' 
      : diffDias === 1 
        ? 'Compromiso vence mañana' 
        : 'Compromiso vence en 2 días';
    return {
      nivel: 'amarillo',
      color: '#f59e0b',
      etiqueta,
      dias_restantes: diffDias,
      alerta_sla: false
    };
  } else {
    return {
      nivel: 'verde',
      color: '#10b981',
      etiqueta: `Compromiso a tiempo (${diffDias} días restantes)`,
      dias_restantes: diffDias,
      alerta_sla: false
    };
  }
};
