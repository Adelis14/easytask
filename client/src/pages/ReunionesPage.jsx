import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Plus,
  Users,
  Video,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  ChevronRight
} from 'lucide-react';

const REUNIONES_INICIALES = [
  {
    id: 1,
    titulo: 'Sincronización Estratégica Q4',
    fecha: '2026-11-20',
    hora: '09:30 AM',
    modalidad: 'Videoconferencia (Meet)',
    estado: 'Programada',
    participantes: ['Líder de Equipo', 'Carlos Mendoza', 'Valeria Soto'],
    minutaId: 1,
    objetivo: 'Revisión final de métricas de cierre de año e indicadores de SLA.'
  },
  {
    id: 2,
    titulo: 'Comité de Arquitectura Cloud y Ciberseguridad',
    fecha: '2026-11-22',
    hora: '02:00 PM',
    modalidad: 'Sala de Juntas B / Híbrida',
    estado: 'Programada',
    participantes: ['Carlos Mendoza', 'Esteban Morales'],
    minutaId: null,
    objetivo: 'Aprobación de topología de alta disponibilidad y réplicas PostgreSQL.'
  },
  {
    id: 3,
    titulo: 'Retrospectiva del Sprint de Auditoría SLA',
    fecha: '2026-11-15',
    hora: '11:00 AM',
    modalidad: 'Remota',
    estado: 'Concluida',
    participantes: ['Equipo Completo'],
    minutaId: 1,
    objetivo: 'Evaluación del tiempo de respuesta inferior a 1.2s en consultas.'
  }
];

export default function ReunionesPage() {
  const navigate = useNavigate();
  const [reuniones, setReuniones] = useState(REUNIONES_INICIALES);
  const [modalNueva, setModalNueva] = useState(false);
  const [form, setForm] = useState({
    titulo: '',
    fecha: '',
    hora: '10:00 AM',
    modalidad: 'Videoconferencia',
    objetivo: ''
  });

  const handleCrear = (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.fecha) return;

    const nueva = {
      id: Date.now(),
      titulo: form.titulo.trim(),
      fecha: form.fecha,
      hora: form.hora,
      modalidad: form.modalidad,
      estado: 'Programada',
      participantes: ['Organizador'],
      minutaId: null,
      objetivo: form.objetivo.trim()
    };

    setReuniones(prev => [nueva, ...prev]);
    setModalNueva(false);
    setForm({
      titulo: '',
      fecha: '',
      hora: '10:00 AM',
      modalidad: 'Videoconferencia',
      objetivo: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-800/60 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Agenda de Sesiones y Reuniones
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Planificación de sesiones de trabajo, comités y vinculación con actas de acuerdos
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setModalNueva(true)}
          className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 active:scale-95 shadow-md shadow-violet-500/20 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Reunión</span>
        </button>
      </div>

      {/* Grid de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold block mb-1">Total Programadas</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {reuniones.filter(r => r.estado === 'Programada').length}
          </span>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">Próximas en calendario</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold block mb-1">Sesiones Concluidas</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {reuniones.filter(r => r.estado === 'Concluida').length}
          </span>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">Con acuerdos documentados</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold block mb-1">Acción Rápida</span>
          <button
            onClick={() => navigate('/minutas')}
            className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
          >
            <span>Ver repositorio de minutas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Lista de Reuniones */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Calendario de Sesiones
        </h2>

        <div className="space-y-3">
          {reuniones.map(r => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    r.estado === 'Concluida'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800'
                  }`}>
                    {r.estado}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{r.fecha}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{r.hora}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {r.titulo}
                </h3>

                {r.objetivo && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                    {r.objetivo}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
                  <Video className="w-3.5 h-3.5 text-violet-500" />
                  <span>{r.modalidad}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {r.minutaId ? (
                  <button
                    onClick={() => navigate('/minutas')}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 hover:bg-violet-600 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Ver Minuta #{r.minutaId}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/minutas')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Formalizar Minuta</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Agendar Reunión */}
      {modalNueva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Agendar Nueva Sesión
              </h3>
              <button
                onClick={() => setModalNueva(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrear} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título de la Reunión <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sesión Extraordinaria de Avance"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.fecha}
                    onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hora
                  </label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={form.hora}
                    onChange={(e) => setForm({ ...form, hora: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Modalidad o Enlace
                </label>
                <input
                  type="text"
                  placeholder="Ej: Google Meet / Sala A"
                  value={form.modalidad}
                  onChange={(e) => setForm({ ...form, modalidad: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Objetivo Principal
                </label>
                <textarea
                  rows="2"
                  placeholder="Temas a tratar y acuerdos esperados..."
                  value={form.objetivo}
                  onChange={(e) => setForm({ ...form, objetivo: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNueva(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-500/20 cursor-pointer"
                >
                  Agendar Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
