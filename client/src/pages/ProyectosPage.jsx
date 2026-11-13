import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Users,
  X,
  TrendingUp,
  FolderKanban
} from 'lucide-react';

const PROYECTOS_INICIALES = [
  {
    id: 1,
    nombre: 'Modernización del Sistema de Tareas',
    descripcion: 'Optimización del sistema central de tareas, garantizando alta velocidad de respuesta y registro seguro de cambios.',
    estado: 'En Ejecución',
    progreso: 85,
    lider: 'Carlos Mendoza',
    fecha_fin: '2026-12-15',
    minutaId: 1
  },
  {
    id: 2,
    nombre: 'Sistema de Gestión de Minutas y Acuerdos',
    descripcion: 'Diseño e implementación de interfaz visual con separación modular de vistas, semáforos y control de acceso.',
    estado: 'En Ejecución',
    progreso: 95,
    lider: 'Valeria Soto',
    fecha_fin: '2026-11-30',
    minutaId: 1
  },
  {
    id: 3,
    nombre: 'Auditoría de Seguridad y Protección de Datos',
    descripcion: 'Evaluación de buenas prácticas de ciberseguridad, resguardo de información institucional y accesos autorizados.',
    estado: 'En Planificación',
    progreso: 30,
    lider: 'Esteban Morales',
    fecha_fin: '2027-01-20',
    minutaId: null
  }
];

export default function ProyectosPage() {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState(PROYECTOS_INICIALES);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    lider: '',
    fecha_fin: '',
    estado: 'En Planificación',
    progreso: 10
  });

  const handleCrear = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;

    const nuevo = {
      id: Date.now(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      lider: form.lider.trim() || 'Equipo EasyTask',
      fecha_fin: form.fecha_fin || '2026-12-31',
      estado: form.estado,
      progreso: Number(form.progreso) || 0,
      minutaId: 1
    };

    setProyectos(prev => [nuevo, ...prev]);
    setModalNuevo(false);
    setForm({
      nombre: '',
      descripcion: '',
      lider: '',
      fecha_fin: '',
      estado: 'En Planificación',
      progreso: 10
    });
  };

  const getBadgeColor = (estado) => {
    switch (estado) {
      case 'En Ejecución':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Concluido':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'En Planificación':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Portafolio de Proyectos Estratégicos
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Iniciativas de alto impacto vinculadas a acuerdos y tareas del equipo
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setModalNuevo(true)}
          className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      {/* Grid de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">Total Proyectos</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{proyectos.length}</span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Iniciativas del plan</p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">En Ejecución Activa</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {proyectos.filter(p => p.estado === 'En Ejecución').length}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Con tareas en curso</p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">Avance Promedio</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {Math.round(proyectos.reduce((acc, p) => acc + p.progreso, 0) / (proyectos.length || 1))}%
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Cumplimiento acumulado</p>
        </div>
      </div>

      {/* Grid de Proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {proyectos.map(p => (
          <div
            key={p.id}
            className="p-5 rounded-3xl bg-white dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeColor(p.estado)}`}>
                  {p.estado}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cierre: {p.fecha_fin}</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-1.5">
                {p.nombre}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                {p.descripcion}
              </p>

              {/* Barra de Progreso */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#131927] border border-slate-200/80 dark:border-slate-800 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Avance General</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{p.progreso}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${p.progreso}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Líder de Proyecto: <strong>{p.lider}</strong></span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => navigate('/compromisos')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>Ver Tareas Vinculadas</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Nuevo Proyecto */}
      {modalNuevo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Crear Nuevo Proyecto
              </h3>
              <button
                onClick={() => setModalNuevo(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrear} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Proyecto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Automatización de Reportes"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción
                </label>
                <textarea
                  rows="2"
                  placeholder="Alcance, entregables y objetivos..."
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Líder Asignado
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Carlos Mendoza"
                    value={form.lider}
                    onChange={(e) => setForm({ ...form, lider: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha Cierre
                  </label>
                  <input
                    type="date"
                    value={form.fecha_fin}
                    onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="En Planificación">En Planificación</option>
                    <option value="En Ejecución">En Ejecución</option>
                    <option value="Concluido">Concluido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Progreso Inicial ({form.progreso}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={form.progreso}
                    onChange={(e) => setForm({ ...form, progreso: e.target.value })}
                    className="w-full mt-2 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNuevo(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  Crear Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
