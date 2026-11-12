import React, { useState } from 'react';
import { X, Users, Calendar, FileText } from 'lucide-react';

const inputStyle = {
  background: 'var(--bg-base)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  borderRadius: '10px',
  padding: '0.5rem 0.875rem',
  fontSize: '0.875rem',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.15s',
};

export default function ModalNuevaMinuta({ onClose, onGuardar }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaReunion, setFechaReunion] = useState(() => new Date().toISOString().slice(0, 16));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onGuardar({ nombre: nombre.trim(), descripcion: descripcion.trim(), fecha_reunion: fechaReunion });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      style={{background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)'}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden animate-scale-in"
        style={{
          background:'var(--bg-surface)',
          border:'1px solid var(--border)',
          boxShadow:'0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{borderBottom:'1px solid var(--border)', background:'var(--bg-base)'}}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl"
              style={{background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.2)'}}>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Nueva Minuta de Reunión</h3>
              <p className="text-xs" style={{color:'var(--text-muted)'}}>
                Formaliza el espacio para registrar compromisos
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl transition-colors"
            style={{color:'var(--text-secondary)'}}
            onMouseEnter={e => e.currentTarget.style.background='var(--bg-card)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-secondary)'}}>
              Nombre de la Minuta / Reunión <span className="text-rose-400">*</span>
            </label>
            <input type="text" required value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Minuta: Comité de Operaciones Q4"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor='#6366f1'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-secondary)'}}>
              Objetivo / Descripción de la Reunión
            </label>
            <textarea rows={3} value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Propósito principal, participantes clave, contexto..."
              style={{...inputStyle, resize:'vertical'}}
              onFocus={e => e.target.style.borderColor='#6366f1'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-secondary)'}}>
              Fecha y Hora de la Reunión
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:'var(--text-muted)'}} />
              <input type="datetime-local" value={fechaReunion}
                onChange={e => setFechaReunion(e.target.value)}
                style={{...inputStyle, paddingLeft:'2.25rem'}}
                onFocus={e => e.target.style.borderColor='#6366f1'}
                onBlur={e => e.target.style.borderColor='var(--border)'}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2"
            style={{borderTop:'1px solid var(--border)', paddingTop:'1rem', marginTop:'0.5rem'}}>
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-xl transition-colors"
              style={{color:'var(--text-secondary)', border:'1px solid var(--border)'}}
              onMouseEnter={e => { e.currentTarget.style.background='var(--bg-card)'; e.currentTarget.style.color='white'; }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-secondary)'; }}>
              Cancelar
            </button>
            <button type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-xl text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
              }}>
              Crear Minuta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
