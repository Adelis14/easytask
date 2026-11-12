import React, { useState, useEffect } from 'react';
import {
  Calendar,
  User,
  AlertTriangle,
  Clock,
  CheckCircle2,
  CheckSquare,
  History,
  SlidersHorizontal,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import { calcularSemaforo } from '../utils/semaforo';

// 4 estados canónicos del flujo estricto (UI-REQ-01)
const ESTADOS_CANONICOS = ['Pendiente', 'En Proceso', 'Entregado', 'Verificado'];

export default function TarjetaCompromiso({
  compromiso = {},
  handleCambioEstado,
  onCambiarEstado,
  onVerHistorial = () => {},
  onToggleChecklist = () => {},
  retraidaDefault = false
}) {
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [retraida, setRetraida] = useState(retraidaDefault);

  useEffect(() => {
    setRetraida(retraidaDefault);
  }, [retraidaDefault]);

  // Helper para ejecutar la transición de estado usando handleCambioEstado o onCambiarEstado
  const ejecutarCambioEstado = (nuevoEstado) => {
    if (typeof handleCambioEstado === 'function') {
      handleCambioEstado(compromiso.id, nuevoEstado);
    } else if (typeof onCambiarEstado === 'function') {
      onCambiarEstado(compromiso, nuevoEstado);
    }
  };

  // 1. Resolución de datos del compromiso
  const tituloCompromiso = compromiso.titulo || compromiso.nombre || 'Compromiso sin título';
  const minutaOrigen = compromiso.minuta_origen || compromiso.minuta_nombre || 'Minuta de Reunión';
  const responsable = compromiso.responsable || 'Sin asignar';

  // Checklist seguro
  const checklist = Array.isArray(compromiso.checklist)
    ? compromiso.checklist
    : (typeof compromiso.checklist === 'string'
        ? (() => { try { return JSON.parse(compromiso.checklist || '[]'); } catch { return []; } })()
        : []);

  const totalChecks = checklist.length;
  const checksCompletados = checklist.filter((item) => item.completed).length;
  const progresoPct = totalChecks > 0 ? Math.round((checksCompletados / totalChecks) * 100) : 0;

  // 2. Formato de fecha legible
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'Sin fecha pactada';
    try {
      const parteFecha = fechaStr.includes('T') ? fechaStr.split('T')[0] : fechaStr;
      const [y, m, d] = parteFecha.split(/[-/]/).map(Number);
      if (!y || !m || !d) return fechaStr;
      const fechaObj = new Date(y, m - 1, d);
      return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(fechaObj);
    } catch {
      return fechaStr;
    }
  };

  const fechaLegible = formatearFecha(compromiso.fecha_vencimiento);

  // 3. Semáforo cromático accesible (WCAG)
  // Soporta tanto string 'rojo'/'amarillo'/'verde' como objeto semaforo o cálculo automático
  const semaforoCalculado = calcularSemaforo(compromiso.fecha_vencimiento);
  const nivelSemaforo = (
    typeof compromiso.semaforo === 'string'
      ? compromiso.semaforo.toLowerCase()
      : compromiso.semaforo?.nivel || semaforoCalculado.nivel || 'verde'
  );

  const configSemaforo = {
    rojo: {
      bordeClass: 'border-red-200 dark:border-red-900/60 hover:border-red-300 dark:hover:border-red-700',
      badgeClass: 'bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/80 rounded-full font-medium text-xs px-2.5 py-0.5',
      glowClass: 'shadow-sm hover:shadow-md transition-shadow',
      etiqueta: 'Vencido / Crítico',
      icono: <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />,
      colorAcento: '#ef4444'
    },
    amarillo: {
      bordeClass: 'border-amber-200 dark:border-amber-900/60 hover:border-amber-300 dark:hover:border-amber-700',
      badgeClass: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 rounded-full font-medium text-xs px-2.5 py-0.5',
      glowClass: 'shadow-sm hover:shadow-md transition-shadow',
      etiqueta: 'Próximo a vencer',
      icono: <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />,
      colorAcento: '#f59e0b'
    },
    verde: {
      bordeClass: 'border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-300 dark:hover:border-emerald-700',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 rounded-full font-medium text-xs px-2.5 py-0.5',
      glowClass: 'shadow-sm hover:shadow-md transition-shadow',
      etiqueta: 'A tiempo',
      icono: <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />,
      colorAcento: '#10b981'
    }
  };

  const semaforoActual = configSemaforo[nivelSemaforo] || configSemaforo.verde;

  // Iniciales para el avatar
  const iniciales = responsable
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'UN';

  const estadoActual = compromiso.estado || 'Pendiente';
  const indexEstadoActual = ESTADOS_CANONICOS.indexOf(estadoActual);

  return (
    <>
      {/* ── Tarjeta Principal de Compromiso (Soporta Modo Claro y Modo Oscuro) ── */}
      <article
        tabIndex={0}
        aria-label={`Compromiso: ${tituloCompromiso}. Estado: ${estadoActual}. Semáforo: ${semaforoActual.etiqueta}. ${retraida ? 'Minimizado' : 'Expandido'}`}
        className="group relative rounded-2xl border border-zinc-200/80 dark:border-slate-800 bg-white dark:bg-[#131927] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      >
        {/* Franja superior indicadora del semáforo accesible */}
        <div
          className="h-1 w-full"
          style={{ background: semaforoActual.colorAcento }}
          aria-hidden="true"
        />

        {retraida ? (
          /* ── Modo Retráctil / Minimizado (Compacto con Semaforización Completa) ── */
          <div className="p-3 space-y-2.5">
            {/* Cabecera del modo retraído: Badge semáforo + Botón de despliegue */}
            <div className="flex items-center justify-between gap-2">
              <span className={`inline-flex items-center gap-1.5 ${semaforoActual.badgeClass} select-none whitespace-nowrap shrink-0`}>
                {semaforoActual.icono}
                <span>{semaforoActual.etiqueta}</span>
              </span>

              <div className="flex items-center gap-1">
                {/* Botón táctil para expandir/ampliar compromiso (>= 44x44px) */}
                <button
                  type="button"
                  onClick={() => setRetraida(false)}
                  title="Ampliar compromiso para leer todos los detalles"
                  aria-label={`Ampliar compromiso: ${tituloCompromiso}`}
                  className="min-w-[44px] min-h-[44px] -my-2 -mr-2 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200" />
                </button>
              </div>
            </div>

            {/* Título y Minuta en modo compacto (clic para ampliar) */}
            <div
              onClick={() => setRetraida(false)}
              className="cursor-pointer"
              title="Haz clic para ampliar la tarjeta"
            >
              <div className="flex items-start gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                  style={{ background: semaforoActual.colorAcento }}
                  title={`Semáforo: ${semaforoActual.etiqueta}`}
                />
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tituloCompromiso}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                    {minutaOrigen}
                  </p>
                </div>
              </div>
            </div>

            {/* Fila compacta de metadatos: Responsable + Fecha + Acciones directas */}
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-zinc-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 min-w-0 pr-1 truncate" title={`Responsable: ${responsable}`}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] text-white shrink-0 shadow-xs bg-zinc-800 dark:bg-slate-700">
                  {iniciales}
                </div>
                <span className="truncate text-zinc-500 dark:text-slate-400 font-medium text-xs max-w-[100px]">{responsable}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-zinc-500 dark:text-slate-400">{fechaLegible}</span>

                {/* Acceso rápido a gestión modal */}
                <button
                  type="button"
                  onClick={() => setModalDetalleAbierto(true)}
                  title="Gestionar Acuerdo"
                  aria-label="Abrir gestión del acuerdo"
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-slate-800 text-zinc-600 dark:text-slate-400 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Modo Expandido (Detallado Completo) ── */
          <div className="p-4 space-y-3.5">
            {/* Fila superior: Badge de semáforo (amplio, sin deformar) + Botón Minimizar */}
            <div className="flex items-center justify-between gap-2">
              {/* Badge Semántico que nunca se deforma ni se parte en varias líneas */}
              <span className={`inline-flex items-center gap-1.5 ${semaforoActual.badgeClass} select-none whitespace-nowrap shrink-0`}>
                {semaforoActual.icono}
                <span>{semaforoActual.etiqueta}</span>
              </span>

              {/* Botón táctil para Minimizar/Retraer (>= 44x44px) */}
              <button
                type="button"
                onClick={() => setRetraida(true)}
                aria-label={`Minimizar compromiso: ${tituloCompromiso}`}
                title="Minimizar tarjeta para no saturar la vista"
                className="min-w-[44px] min-h-[44px] -my-2 -mr-2 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronUp className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200" />
              </button>
            </div>

            {/* Título obligatorio del Compromiso y Minuta Origen (SRS 2.1) */}
            <div>
              <div className="flex items-start gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                  style={{ background: semaforoActual.colorAcento }}
                  title={`Semáforo: ${semaforoActual.etiqueta}`}
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tituloCompromiso}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {minutaOrigen}
                  </p>
                </div>
              </div>
              {compromiso.descripcion && (
                <p className="text-xs mt-1.5 line-clamp-2 text-slate-600 dark:text-slate-400 pl-4.5">
                  {compromiso.descripcion}
                </p>
              )}
            </div>

            {/* Barra de progreso rápida si cuenta con checklist */}
            {totalChecks > 0 && (
              <div className="bg-zinc-50 dark:bg-slate-900/60 border border-zinc-200/60 dark:border-slate-800 rounded-xl p-3 text-zinc-700 dark:text-slate-300 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-zinc-600 dark:text-slate-300">
                    <CheckSquare className="w-3.5 h-3.5 text-zinc-500 dark:text-slate-400" aria-hidden="true" />
                    Puntos de Control
                  </span>
                  <span className="font-mono font-semibold text-zinc-700 dark:text-slate-200 text-xs">
                    {checksCompletados}/{totalChecks} · {progresoPct}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progresoPct}%`,
                      background: progresoPct === 100 ? '#10b981' : (nivelSemaforo === 'verde' ? '#10b981' : semaforoActual.colorAcento)
                    }}
                  />
                </div>
              </div>
            )}

            {/* Fila de Metadatos Obligatorios: Responsable + Fecha legible */}
            <div className="flex items-center justify-between text-xs pt-2.5 border-t border-zinc-100 dark:border-slate-800/80">
              {/* Responsable asignado (Avatar + Nombre) */}
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-xs bg-zinc-800 dark:bg-slate-700"
                  title={`Responsable: ${responsable}`}
                  aria-label={`Avatar de ${responsable}`}
                >
                  {iniciales}
                </div>
                <span className="truncate text-zinc-500 dark:text-slate-300 text-xs font-medium max-w-[120px]">
                  {responsable}
                </span>
              </div>

              {/* Fecha límite de entrega en formato legible */}
              <div
                className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-slate-400 text-xs font-medium shrink-0 font-mono"
                title={`Fecha límite de cumplimiento: ${fechaLegible}`}
              >
                <Calendar className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                <span>{fechaLegible}</span>
              </div>
            </div>

            {/* Barra de Acciones con Ergonomía Táctil (Mínimo 44x44px por botón interactivo) */}
            <div className="flex items-center justify-between gap-1 pt-2 border-t border-zinc-100 dark:border-slate-800/80">
              {/* Botón táctil: Historial de Auditoría (44x44px) */}
              <button
                type="button"
                onClick={() => onVerHistorial(compromiso)}
                title="Consultar historial inmutable de auditoría"
                aria-label="Ver historial de auditoría de este compromiso"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-slate-800 text-zinc-600 dark:text-slate-400 active:scale-95 transition-all cursor-pointer"
              >
                <History className="w-4 h-4" />
              </button>

              {/* Botón Divulgación Progresiva: Abrir detalles y checklist (Área táctil >= 44px) */}
              <button
                type="button"
                onClick={() => setModalDetalleAbierto(true)}
                aria-label="Gestionar puntos de control y transiciones de este compromiso"
                className="min-h-[44px] px-3.5 flex items-center justify-center gap-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-slate-200 bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 dark:hover:bg-slate-700 hover:text-zinc-900 dark:hover:text-white active:scale-95 transition-all border border-zinc-200/80 dark:border-slate-700 shadow-xs cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500 dark:text-slate-400" aria-hidden="true" />
                <span>Gestionar Acuerdo</span>
              </button>

              {/* Botón táctil de avance rápido de estado (44x44px) */}
              <button
                type="button"
                disabled={indexEstadoActual >= ESTADOS_CANONICOS.length - 1}
                onClick={() => {
                  if (indexEstadoActual < ESTADOS_CANONICOS.length - 1) {
                    ejecutarCambioEstado(ESTADOS_CANONICOS[indexEstadoActual + 1]);
                  }
                }}
                title={
                  indexEstadoActual < ESTADOS_CANONICOS.length - 1
                    ? `Avanzar a ${ESTADOS_CANONICOS[indexEstadoActual + 1]}`
                    : 'Compromiso en estado final (Verificado)'
                }
                aria-label="Avanzar compromiso al siguiente estado del flujo"
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border transition-all ${
                  indexEstadoActual >= ESTADOS_CANONICOS.length - 1
                    ? 'opacity-30 border-zinc-200 dark:border-slate-800 text-zinc-300 dark:text-slate-600 cursor-not-allowed'
                    : 'hover:bg-zinc-100 dark:hover:bg-slate-800 text-zinc-600 dark:text-slate-300 rounded-lg p-1.5 border-zinc-200 dark:border-slate-700 active:scale-95 cursor-pointer'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </article>

      {/* ── Modal / Bottom Sheet de Divulgación Progresiva (Progressive Disclosure) ── */}
      {modalDetalleAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`dialog-title-${compromiso.id}`}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 dark:bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalDetalleAbierto(false);
          }}
        >
          <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-[#0f1523] shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
            {/* Header del Modal */}
            <div className="p-4 sm:p-5 border-b border-zinc-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-white dark:bg-[#0f1523]">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1.5 ${semaforoActual.badgeClass} select-none whitespace-nowrap`}>
                    {semaforoActual.icono}
                    {semaforoActual.etiqueta}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-slate-400 truncate">
                    {minutaOrigen}
                  </span>
                </div>
                <h3
                  id={`dialog-title-${compromiso.id}`}
                  className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white truncate"
                >
                  {tituloCompromiso}
                </h3>
              </div>

              {/* Botón Cerrar táctil de 44x44px */}
              <button
                type="button"
                onClick={() => setModalDetalleAbierto(false)}
                aria-label="Cerrar panel de gestión del compromiso"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-slate-800 active:scale-95 transition-all border border-zinc-200 dark:border-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-white dark:bg-[#0f1523]">
              {/* Información y fechas */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-zinc-200/80 dark:border-slate-800 bg-zinc-50 dark:bg-[#131927] text-xs">
                <div>
                  <span className="text-zinc-500 dark:text-slate-400 block mb-0.5">Responsable</span>
                  <span className="font-semibold text-zinc-900 dark:text-slate-200">{responsable}</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-slate-400 block mb-0.5">Vencimiento</span>
                  <span className="font-semibold text-zinc-900 dark:text-slate-200">{fechaLegible}</span>
                </div>
              </div>

              {/* Sección 1: Checklist de subtareas (Puntos de Control) con área táctil >= 44px */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-zinc-600 dark:text-slate-400" aria-hidden="true" />
                    Puntos de Control / Checklist
                  </h4>
                  <span className="text-xs font-mono text-zinc-700 dark:text-slate-300 font-semibold">
                    {checksCompletados}/{totalChecks} ({progresoPct}%)
                  </span>
                </div>

                {checklist.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-slate-800 text-center text-xs text-zinc-500 dark:text-slate-400">
                    No se especificaron puntos de control adicionales para este compromiso.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {checklist.map((item) => (
                      <label
                        key={item.id}
                        className={`min-h-[44px] px-3.5 py-2.5 rounded-xl border flex items-center gap-3 cursor-pointer select-none transition-all active:scale-[0.99] ${
                          item.completed
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-zinc-400 dark:text-slate-500'
                            : 'bg-white dark:bg-[#131927] border-zinc-200 dark:border-slate-800 text-zinc-800 dark:text-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => onToggleChecklist(compromiso, item.id)}
                          className="w-5 h-5 rounded border-zinc-300 dark:border-slate-700 text-zinc-900 dark:text-indigo-600 focus:ring-zinc-800 shrink-0 cursor-pointer"
                        />
                        <span
                          className={`text-sm ${
                            item.completed
                              ? 'line-through text-zinc-400 dark:text-slate-500 font-normal'
                              : 'text-zinc-800 dark:text-slate-200 font-medium'
                          }`}
                        >
                          {item.text}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Sección 2: Transición de Estados (Estrictamente los 4 estados canónicos) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                  Mover Compromiso de Estado (Flujo Obligatorio)
                </h4>

                <div className="grid grid-cols-2 gap-2.5">
                  {ESTADOS_CANONICOS.map((est) => {
                    const esActivo = estadoActual === est;

                    return (
                      <button
                        key={est}
                        type="button"
                        onClick={() => {
                          if (!esActivo) {
                            ejecutarCambioEstado(est);
                            setModalDetalleAbierto(false);
                          }
                        }}
                        disabled={esActivo}
                        className={`min-h-[44px] px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
                          esActivo
                            ? 'bg-zinc-900 dark:bg-indigo-600 text-white border-zinc-900 dark:border-indigo-500 shadow-sm cursor-default'
                            : 'bg-white dark:bg-[#131927] text-zinc-700 dark:text-slate-300 border-zinc-200 dark:border-slate-800 hover:bg-zinc-100 dark:hover:bg-slate-800 hover:text-zinc-900 dark:hover:text-white active:scale-95 cursor-pointer'
                        }`}
                      >
                        <span>{est}</span>
                        {esActivo ? (
                          <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-1.5 py-0.5 rounded">
                            Actual
                          </span>
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 opacity-50" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer con botón táctil para cerrar */}
            <div className="p-4 border-t border-zinc-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-zinc-50 dark:bg-[#131927]">
              <button
                type="button"
                onClick={() => {
                  setModalDetalleAbierto(false);
                  onVerHistorial(compromiso);
                }}
                className="min-h-[44px] px-4 flex items-center gap-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-slate-800 border border-zinc-200 dark:border-slate-700 active:scale-95 transition-all cursor-pointer"
              >
                <History className="w-4 h-4 text-zinc-600 dark:text-slate-400" aria-hidden="true" />
                <span>Historial</span>
              </button>

              <button
                type="button"
                onClick={() => setModalDetalleAbierto(false)}
                className="bg-zinc-900 dark:bg-indigo-600 text-white hover:bg-zinc-800 dark:hover:bg-indigo-500 rounded-xl font-medium min-h-[44px] px-5 flex items-center justify-center text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
