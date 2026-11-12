import React from 'react';
import SkeletonTarjeta from './SkeletonTarjeta';

// 4 estados canónicos del flujo estricto (UI-REQ-01)
const ESTADOS_SKELETON = [
  { nombre: 'Pendiente', tarjetasCount: 3, colorPunto: 'bg-zinc-400' },
  { nombre: 'En Proceso', tarjetasCount: 3, colorPunto: 'bg-blue-500' },
  { nombre: 'Entregado', tarjetasCount: 2, colorPunto: 'bg-purple-500' },
  { nombre: 'Verificado', tarjetasCount: 2, colorPunto: 'bg-emerald-500' }
];

/**
 * SkeletonKanban.jsx
 * Simula el layout completo de las 4 columnas operativas del tablero kanban
 * durante la carga inicial o transiciones asíncronas (< 1.2s SLA).
 * Elimina el Cumulative Layout Shift (CLS) y provee retroalimentación visual inmediata.
 * 
 * @param {Object} props
 * @param {number} props.tarjetasPorColumna - Cantidad opcional de tarjetas ficticias por columna (default: 3)
 */
export default function SkeletonKanban({ tarjetasPorColumna }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Cargando compromisos del tablero..."
      className="w-full space-y-4"
    >
      <span className="sr-only">Cargando compromisos y minutas del sistema...</span>

      {/* Grid adaptable por breakpoints (RWD-4.1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-5 items-start">
        {ESTADOS_SKELETON.map((col, index) => {
          const cantidad = tarjetasPorColumna || col.tarjetasCount;

          return (
            <div
              key={index}
              className="bg-zinc-100/70 border border-zinc-200/60 rounded-2xl flex flex-col overflow-hidden shadow-xs"
            >
              {/* Header simulado de la columna con nombre de estado */}
              <div className="p-3.5 border-b border-zinc-200/80 bg-white/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${col.colorPunto} opacity-70 animate-pulse`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      {col.nombre}
                    </span>
                  </div>
                  {/* Badge de contador simulado */}
                  <div className="h-5 w-6 rounded-full bg-zinc-200 animate-pulse" />
                </div>
                {/* Línea descriptiva */}
                <div className="h-2.5 bg-zinc-200 rounded w-4/5 mt-2 animate-pulse" />
              </div>

              {/* Contenedor de 2 o 3 tarjetas ficticias por columna */}
              <div className="p-3 space-y-3 min-h-[420px]">
                {Array.from({ length: cantidad }).map((_, cardIndex) => (
                  <SkeletonTarjeta key={cardIndex} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
