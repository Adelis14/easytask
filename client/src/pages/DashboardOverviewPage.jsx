import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  Calendar,
  Users,
  Briefcase,
  ArrowRight,
  Check
} from 'lucide-react';
import { getTableros, getCompromisosPorTablero, getUsuarios } from '../services/api';

export default function DashboardOverviewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [minutas, setMinutas] = useState([]);
  const [compromisos, setCompromisos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [tabs, usrs] = await Promise.all([
        getTableros().catch(() => []),
        getUsuarios().catch(() => [])
      ]);
      setMinutas(tabs);
      setUsuarios(usrs);

      if (tabs.length > 0) {
        const comps = await getCompromisosPorTablero(tabs[0].id).catch(() => []);
        setCompromisos(comps);
      }
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Clasificación cromática unificada
  const obtenerColor = (c) => {
    const est = (c.estado || '').toLowerCase();
    if (est === 'listo' || est === 'verificado' || est === 'entregado') return 'Verde';
    if (est === 'en proceso') return 'Amarillo';
    return 'Rojo'; // Iniciado / Pendiente / Urgente
  };

  const total = compromisos.length;
  const rojos = compromisos.filter(c => obtenerColor(c) === 'Rojo');
  const amarillos = compromisos.filter(c => obtenerColor(c) === 'Amarillo');
  const verdes = compromisos.filter(c => obtenerColor(c) === 'Verde');
  const efectividad = total > 0 ? Math.round((verdes.length / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Banner Principal */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Panel General de Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Control y Seguimiento de Tareas
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
            Monitorea el progreso de los acuerdos y tareas asignadas con clasificación cromática: 🔴 Rojo (Iniciado / Urgente), 🟡 Amarillo (En Proceso) y 🟢 Verde (Listo).
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => navigate('/compromisos')}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs shadow-md hover:bg-blue-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Ir al Tablero de Tareas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/minutas')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer border border-white/20"
            >
              <span>Gestionar Minutas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Resumen por Estado */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total General */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total de Tareas</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {total}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Registradas en el sistema</p>
        </div>

        {/* 🔴 Rojo */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f1523] border border-red-200/60 dark:border-red-950/60 shadow-xs">
          <div className="flex items-center justify-between text-red-600 dark:text-red-400 mb-2">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              Rojo (Iniciadas / Urgentes)
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 font-mono">
            {rojos.length}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Por iniciar o de atención urgente</p>
        </div>

        {/* 🟡 Amarillo */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f1523] border border-amber-200/60 dark:border-amber-950/60 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Amarillo (En Proceso)
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {amarillos.length}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Con avances en ejecución</p>
        </div>

        {/* 🟢 Verde */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f1523] border border-emerald-200/60 dark:border-emerald-950/60 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Verde (Listas)
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {verdes.length}
          </span>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${efectividad}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid de Secciones: Módulos y Tareas en Rojo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atajos a Módulos */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Módulos del Sistema
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/compromisos')}
              className="p-5 rounded-3xl bg-white dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-md transition-all text-left flex items-start gap-4 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tablero de Tareas</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Flujo visual organizado en Rojo, Amarillo y Verde con cambio rápido de estado.
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/minutas')}
              className="p-5 rounded-3xl bg-white dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-md transition-all text-left flex items-start gap-4 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gestión de Minutas</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Creación formal de actas, registro de acuerdos y vinculación directa con tareas.
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/reuniones')}
              className="p-5 rounded-3xl bg-white dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 hover:border-violet-500/50 hover:shadow-md transition-all text-left flex items-start gap-4 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-900/60 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Agenda de Reuniones</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Planificación de sesiones de trabajo, participantes convocados y calendario.
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/usuarios')}
              className="p-5 rounded-3xl bg-white dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/50 hover:shadow-md transition-all text-left flex items-start gap-4 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900/60 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Directorio de Usuarios</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Colaboradores del equipo, carga de tareas asignadas y registro de nuevos usuarios.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Panel Lateral: Tareas Prioritarias en Rojo */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tareas Prioritarias (Rojo)
          </h2>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            {rojos.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                ¡Excelente! No tienes tareas en rojo.
              </div>
            ) : (
              rojos.slice(0, 4).map(c => (
                <div
                  key={c.id}
                  onClick={() => navigate('/compromisos')}
                  className="p-3.5 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 text-xs cursor-pointer hover:bg-red-100/50 transition-all"
                >
                  <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                    {c.titulo || c.nombre}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-red-600 dark:text-red-400 mt-1.5">
                    <span>{c.responsable || 'Sin asignar'}</span>
                    <span className="font-bold">Iniciado / Urgente</span>
                  </div>
                </div>
              ))
            )}

            <button
              onClick={() => navigate('/compromisos')}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Ver todas en el Tablero</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
