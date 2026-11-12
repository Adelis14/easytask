import React from 'react';
import { X, History, ArrowRight, Clock, ShieldCheck, Calendar, Tag } from 'lucide-react';

const ESTADO_COLORS = {
  'Pendiente':  { bg:'rgba(100,116,139,0.15)', color:'#94a3b8', border:'rgba(100,116,139,0.3)' },
  'En Proceso': { bg:'rgba(59,130,246,0.15)',  color:'#93c5fd', border:'rgba(59,130,246,0.3)' },
  'Entregado':  { bg:'rgba(168,85,247,0.15)',  color:'#d8b4fe', border:'rgba(168,85,247,0.3)' },
  'Verificado': { bg:'rgba(16,185,129,0.15)',  color:'#6ee7b7', border:'rgba(16,185,129,0.3)' },
  'Creado':     { bg:'rgba(99,102,241,0.1)',   color:'#a5b4fc', border:'rgba(99,102,241,0.2)' },
};

function EstadoBadge({ estado }) {
  const c = ESTADO_COLORS[estado] || ESTADO_COLORS['Creado'];
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{background: c.bg, color: c.color, border: `1px solid ${c.border}`}}>
      {estado}
    </span>
  );
}

export default function ModalHistorial({ compromiso, historial, onClose }) {
  if (!compromiso) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      style={{background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)'}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden animate-scale-in"
        style={{
          background:'var(--bg-surface)',
          border:'1px solid var(--border)',
          maxHeight:'90vh',
          boxShadow:'0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{borderBottom:'1px solid var(--border)', background:'var(--bg-base)'}}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl"
              style={{background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.2)'}}>
              <History className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{color:'var(--text-primary)'}}>Registro de Auditoría</h3>
              <p className="text-xs" style={{color:'var(--text-muted)'}}>
                Historial inmutable del compromiso
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl transition-colors"
            style={{color:'var(--text-secondary)'}}
            onMouseEnter={e => { e.currentTarget.style.background='var(--bg-card)'; e.currentTarget.style.color='white'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-secondary)'; }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info del compromiso */}
        <div className="px-5 py-3" style={{background:'var(--bg-card)', borderBottom:'1px solid var(--border)'}}>
          <div className="flex items-start gap-3">
            <Tag className="w-4 h-4 mt-0.5 text-indigo-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold leading-snug" style={{color:'var(--text-primary)'}}>{compromiso.titulo || compromiso.nombre}</p>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <EstadoBadge estado={compromiso.estado} />
                <span className="flex items-center gap-1 text-[11px]" style={{color:'var(--text-muted)'}}>
                  <Calendar className="w-3 h-3" />
                  {compromiso.fecha_vencimiento}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline de auditoría */}
        <div className="flex-1 overflow-y-auto p-5">
          {historial.length === 0 ? (
            <div className="text-center py-10 text-sm" style={{color:'var(--text-muted)'}}>
              <History className="w-10 h-10 mx-auto mb-3 opacity-20" />
              Sin transiciones registradas aún
            </div>
          ) : (
            <div className="relative space-y-4 ml-3"
              style={{borderLeft:'2px solid rgba(99,102,241,0.2)'}}>
              {historial.map((item, idx) => {
                const fecha = new Date(item.fecha_cambio).toLocaleString('es-ES', {
                  day:'2-digit', month:'short', year:'numeric',
                  hour:'2-digit', minute:'2-digit',
                });
                return (
                  <div key={item.id || idx} className="relative pl-5">
                    {/* Nodo */}
                    <div
                      className="absolute -left-[9px] top-2.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{background:'var(--bg-surface)', border:'2px solid #6366f1'}}>
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    </div>
                    <div className="rounded-xl p-3 transition-colors"
                      style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                      {/* Transición de estados */}
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <EstadoBadge estado={item.estado_anterior} />
                        <ArrowRight className="w-3.5 h-3.5" style={{color:'var(--text-muted)'}} />
                        <EstadoBadge estado={item.estado_nuevo} />
                      </div>
                      {/* Motivo */}
                      {item.motivo && (
                        <p className="text-xs italic mb-1.5" style={{color:'var(--text-secondary)'}}>
                          "{item.motivo}"
                        </p>
                      )}
                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-[11px]" style={{color:'var(--text-muted)'}}>
                        <Clock className="w-3 h-3" />
                        {fecha}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex items-center justify-between"
          style={{borderTop:'1px solid var(--border)', background:'var(--bg-base)'}}>
          <div className="flex items-center gap-2 text-xs font-medium" style={{color:'#6ee7b7'}}>
            <ShieldCheck className="w-4 h-4" />
            Auditoría inmutable garantizada
          </div>
          <button onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            style={{background:'var(--bg-card)', color:'var(--text-primary)', border:'1px solid var(--border-mid)'}}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
