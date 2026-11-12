import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Componente Toast atómico y accesible para confirmación de acciones discretas (ej. "Compromiso movido a Verificado")
 * Estilo Tema Claro VitrinaGO / Encarga con ergonomía táctil (área mínima 44x44px) y alto contraste accesible.
 *
 * @param {Object} props
 * @param {string} props.message - Texto descriptivo del evento
 * @param {'success'|'error'|'warning'|'info'} [props.type='success'] - Tipo semántico de notificación
 * @param {number} [props.duration=3500] - Tiempo de auto-cierre en ms (0 para persistente)
 * @param {Function} [props.onClose] - Callback al descartar el toast
 * @param {string} [props.position='bottom-right'] - Posición en pantalla ('bottom-right' | 'top-right' | 'bottom-center')
 */
export default function Toast({
  message = '',
  type = 'success',
  duration = 3500,
  onClose = () => {},
  position = 'bottom-right'
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!duration || duration <= 0) return;
    const timer = setTimeout(() => {
      setVisible(false);
      if (typeof onClose === 'function') onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible || !message) return null;

  const handleDismiss = () => {
    setVisible(false);
    if (typeof onClose === 'function') onClose();
  };

  // Configuración cromática clara y accesible (WCAG)
  const CONFIG_TIPOS = {
    success: {
      icono: <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" aria-hidden="true" />,
      fondo: '#ffffff',
      borde: '#a7f3d0',
      texto: '#065f46'
    },
    error: {
      icono: <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" aria-hidden="true" />,
      fondo: '#ffffff',
      borde: '#fecdd3',
      texto: '#9f1239'
    },
    warning: {
      icono: <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" aria-hidden="true" />,
      fondo: '#ffffff',
      borde: '#fde68a',
      texto: '#92400e'
    },
    info: {
      icono: <Info className="w-4 h-4 shrink-0 text-zinc-700" aria-hidden="true" />,
      fondo: '#ffffff',
      borde: '#e4e4e7',
      texto: '#18181b'
    }
  };

  const estiloActual = CONFIG_TIPOS[type] || CONFIG_TIPOS.success;

  // Posicionamiento responsivo
  const POSICIONES = {
    'bottom-right': 'fixed bottom-5 right-5 z-[9999]',
    'top-right': 'fixed top-5 right-5 z-[9999]',
    'bottom-center': 'fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999]'
  };

  return (
    <aside
      role="status"
      aria-live="polite"
      className={`${POSICIONES[position] || POSICIONES['bottom-right']} max-w-sm w-[calc(100vw-2.5rem)] sm:w-auto animate-fade-in pointer-events-auto`}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-md transition-all select-none bg-white"
        style={{
          backgroundColor: estiloActual.fondo,
          borderColor: estiloActual.borde,
          color: estiloActual.texto,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}
      >
        {estiloActual.icono}

        <p className="text-xs font-semibold tracking-wide flex-1 leading-snug">
          {message}
        </p>

        {/* Botón táctil para descartar (mínimo 44x44px de área de interacción) */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Cerrar notificación"
          className="min-w-[44px] min-h-[44px] -my-2 -mr-2 flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 active:scale-95 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
