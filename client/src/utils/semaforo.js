/**
 * EasyTask - Lógica de Semáforo de Acuerdos (UI-REQ-01)
 * Verde: A tiempo (> 2 días), Amarillo: ≤ 2 días, Rojo: vencido
 */
export const calcularSemaforo = (fechaVencimientoStr) => {
  if (!fechaVencimientoStr) {
    return { nivel: 'gris', etiqueta: 'Sin fecha', badgeClass: '', indicadorClass: 'bg-slate-600' };
  }

  const ahora = new Date();
  ahora.setHours(0, 0, 0, 0);

  let fechaVenc;
  if (typeof fechaVencimientoStr === 'string' && fechaVencimientoStr.includes('T')) {
    fechaVenc = new Date(fechaVencimientoStr);
  } else if (typeof fechaVencimientoStr === 'string') {
    const [y, m, d] = fechaVencimientoStr.split(/[-/]/).map(Number);
    fechaVenc = new Date(y, m - 1, d);
  } else {
    fechaVenc = new Date(fechaVencimientoStr);
  }
  fechaVenc.setHours(0, 0, 0, 0);

  const diffDias = Math.ceil((fechaVenc - ahora) / (1000 * 60 * 60 * 24));

  if (diffDias < 0) {
    const abs = Math.abs(diffDias);
    return {
      nivel: 'rojo',
      etiqueta: abs === 1 ? 'Vencido ayer' : `Vencido hace ${abs} días`,
      color: '#ef4444',
      badgeStyle: { background:'rgba(239,68,68,0.12)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.25)' },
      indicadorClass: 'animate-pulse-ring',
      indicadorColor: '#ef4444',
    };
  } else if (diffDias <= 2) {
    const etiqueta = diffDias === 0 ? 'Vence hoy' : diffDias === 1 ? 'Vence mañana' : 'Vence en 2 días';
    return {
      nivel: 'amarillo',
      etiqueta,
      color: '#f59e0b',
      badgeStyle: { background:'rgba(245,158,11,0.12)', color:'#fcd34d', border:'1px solid rgba(245,158,11,0.25)' },
      indicadorClass: '',
      indicadorColor: '#f59e0b',
    };
  } else {
    return {
      nivel: 'verde',
      etiqueta: `A tiempo · ${diffDias}d`,
      color: '#10b981',
      badgeStyle: { background:'rgba(16,185,129,0.12)', color:'#6ee7b7', border:'1px solid rgba(16,185,129,0.25)' },
      indicadorClass: '',
      indicadorColor: '#10b981',
    };
  }
};

export const ESTADOS = ['Pendiente', 'En Proceso', 'Entregado', 'Verificado'];

export const CONFIG_ESTADOS = {
  'Pendiente': {
    titulo: 'Pendiente',
    descripcion: 'Compromisos formalizados sin iniciar',
    color: '#64748b',
    colClass: 'col-pendiente',
  },
  'En Proceso': {
    titulo: 'En Proceso',
    descripcion: 'Compromisos en ejecución activa',
    color: '#3b82f6',
    colClass: 'col-proceso',
  },
  'Entregado': {
    titulo: 'Entregado',
    descripcion: 'Entregados, pendientes de verificación',
    color: '#a855f7',
    colClass: 'col-entregado',
  },
  'Verificado': {
    titulo: 'Verificado',
    descripcion: 'Acuerdos cerrados con conformidad',
    color: '#10b981',
    colClass: 'col-verificado',
  },
};
