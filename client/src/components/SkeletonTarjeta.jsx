import React from 'react';

/**
 * SkeletonTarjeta.jsx
 * Componente de retroalimentación asíncrona (HCI: Visibilidad del Estado del Sistema).
 * Simula de forma idéntica la geometría y distribución de 'TarjetaCompromiso.jsx'
 * con 'animate-pulse' para mitigar el Cumulative Layout Shift (CLS) durante la carga (< 1.2s).
 */
export default function SkeletonTarjeta() {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border border-zinc-200/80 dark:border-slate-800 bg-white dark:bg-[#131927] p-4 space-y-3.5 shadow-xs animate-pulse select-none overflow-hidden relative"
    >
      {/* Franja superior simulada del semáforo */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-200 dark:bg-slate-700/60" />

      {/* Fila superior: Píldora del semáforo */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        {/* Píldora del semáforo */}
        <div className="h-5 w-32 rounded-full bg-zinc-100 dark:bg-slate-800" />
        <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-slate-800" />
      </div>

      {/* Título en dos líneas */}
      <div className="space-y-2 py-0.5">
        <div className="h-4 bg-zinc-200 dark:bg-slate-800 rounded-md w-5/6" />
        <div className="h-3.5 bg-zinc-200 dark:bg-slate-800 rounded-md w-3/5" />
      </div>

      {/* Caja de barra de checklist / Puntos de control */}
      <div className="rounded-xl p-3 space-y-2 border border-zinc-200/60 dark:border-slate-800 bg-zinc-50 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 bg-zinc-200 dark:bg-slate-800 rounded" />
          <div className="h-3 w-12 bg-zinc-200 dark:bg-slate-800 rounded font-mono" />
        </div>
        {/* Barra de progreso de checklist */}
        <div className="w-full h-1.5 bg-zinc-200 dark:bg-slate-800 rounded-full" />
      </div>

      {/* Metadatos: Footer con Avatar del Responsable y Fecha legible */}
      <div className="flex items-center justify-between pt-2.5 border-t border-zinc-100 dark:border-slate-800">
        {/* Avatar + Nombre del responsable */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-slate-800 shrink-0" />
          <div className="h-3.5 w-24 bg-zinc-200 dark:bg-slate-800 rounded" />
        </div>

        {/* Fecha en formato legible */}
        <div className="h-3.5 w-20 bg-zinc-200 dark:bg-slate-800 rounded" />
      </div>

      {/* Barra inferior de acciones táctiles (Ergonomía táctil 44px) */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-slate-800">
        <div className="min-w-[44px] min-h-[44px] rounded-lg bg-zinc-100 dark:bg-slate-800" />
        <div className="flex-1 min-h-[44px] rounded-xl bg-zinc-100 dark:bg-slate-800" />
        <div className="min-w-[44px] min-h-[44px] rounded-lg bg-zinc-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}
