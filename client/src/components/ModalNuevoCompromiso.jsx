import React, { useState } from 'react';
import { X, Plus, Trash2, Calendar, User, CheckCircle2 } from 'lucide-react';

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

function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-secondary)'}}>
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function ModalNuevoCompromiso({ tableroId, onClose, onGuardar }) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [responsable, setResponsable] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [estado, setEstado] = useState('Pendiente');
  const [nuevoItem, setNuevoItem] = useState('');
  const [checklist, setChecklist] = useState([]);

  const agregarItem = () => {
    if (!nuevoItem.trim()) return;
    setChecklist(prev => [...prev, { id: Date.now(), text: nuevoItem.trim(), completed: false }]);
    setNuevoItem('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!titulo.trim() || !fechaVencimiento) return;
    onGuardar({ tablero_id: tableroId, titulo: titulo.trim(), descripcion: descripcion.trim(), responsable: responsable.trim(), fecha_vencimiento: fechaVencimiento, estado, checklist });
  };

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
          maxHeight:'92vh',
          boxShadow:'0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{borderBottom:'1px solid var(--border)', background:'var(--bg-base)'}}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl"
              style={{background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.2)'}}>
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{color:'var(--text-primary)'}}>Pactar Nuevo Compromiso</h3>
              <p className="text-xs" style={{color:'var(--text-muted)'}}>Formalizar acuerdo de la reunión</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl transition-colors"
            style={{color:'var(--text-secondary)'}}
            onMouseEnter={e => { e.currentTarget.style.background='var(--bg-card)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <Field label="Título del Compromiso" required>
            <input
              type="text" required value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ej: Entregar revisión de arquitectura"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor='#6366f1'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
          </Field>

          <Field label="Descripción / Alcance del Acuerdo">
            <textarea
              rows={2} value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Detalles consensuados durante la reunión..."
              style={{...inputStyle, resize:'vertical'}}
              onFocus={e => e.target.style.borderColor='#6366f1'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Responsable">
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{color:'var(--text-muted)'}} />
                <input type="text" value={responsable}
                  onChange={e => setResponsable(e.target.value)}
                  placeholder="Nombre o alias"
                  style={{...inputStyle, paddingLeft:'2.25rem'}}
                  onFocus={e => e.target.style.borderColor='#6366f1'}
                  onBlur={e => e.target.style.borderColor='var(--border)'}
                />
              </div>
            </Field>

            <Field label="Fecha de Vencimiento" required>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:'var(--text-muted)'}} />
                <input type="date" required value={fechaVencimiento}
                  onChange={e => setFechaVencimiento(e.target.value)}
                  style={{...inputStyle, paddingLeft:'2.25rem'}}
                  onFocus={e => e.target.style.borderColor='#6366f1'}
                  onBlur={e => e.target.style.borderColor='var(--border)'}
                />
              </div>
            </Field>
          </div>

          <Field label="Estado Inicial">
            <select value={estado} onChange={e => setEstado(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor='#6366f1'}
              onBlur={e => e.target.style.borderColor='var(--border)'}>
              <option>Pendiente</option>
              <option>En Proceso</option>
              <option>Entregado</option>
              <option>Verificado</option>
            </select>
          </Field>

          {/* Checklist */}
          <Field label="Puntos de Control (Checklist)">
            <div className="flex gap-2 mb-2">
              <input
                type="text" value={nuevoItem}
                onChange={e => setNuevoItem(e.target.value)}
                placeholder="Añadir punto clave..."
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), agregarItem())}
                style={{...inputStyle, fontSize:'0.8125rem'}}
                onFocus={e => e.target.style.borderColor='#6366f1'}
                onBlur={e => e.target.style.borderColor='var(--border)'}
              />
              <button type="button" onClick={agregarItem}
                className="px-3 rounded-xl transition-colors shrink-0"
                style={{background:'rgba(99,102,241,0.12)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.2)'}}>
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {checklist.length > 0 && (
              <div className="rounded-xl p-3 space-y-1.5"
                style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                {checklist.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-xs"
                    style={{color:'var(--text-secondary)'}}>
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-indigo-400" />
                      {item.text}
                    </span>
                    <button type="button" onClick={() => setChecklist(prev => prev.filter(i => i.id !== item.id))}
                      className="p-0.5 transition-colors"
                      style={{color:'var(--text-muted)'}}
                      onMouseEnter={e => e.currentTarget.style.color='#fca5a5'}
                      onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Field>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 shrink-0"
          style={{borderTop:'1px solid var(--border)', background:'var(--bg-base)'}}>
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl transition-colors"
            style={{color:'var(--text-secondary)', border:'1px solid var(--border)', background:'transparent'}}
            onMouseEnter={e => { e.currentTarget.style.background='var(--bg-card)'; e.currentTarget.style.color='var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-secondary)'; }}>
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-semibold rounded-xl text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
            }}>
            Registrar Compromiso
          </button>
        </div>
      </div>
    </div>
  );
}
