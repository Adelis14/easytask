import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Calendar,
  ExternalLink,
  Trash2,
  Check,
  X,
  Search,
  CheckCircle2,
  FolderPlus
} from 'lucide-react';
import { getTableros, crearTablero, eliminarTablero } from '../services/api';

export default function MinutasPage() {
  const navigate = useNavigate();
  const [minutas, setMinutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalNueva, setModalNueva] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    fecha_reunion: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    cargarMinutas();
  }, []);

  const cargarMinutas = async () => {
    setLoading(true);
    try {
      const data = await getTableros();
      setMinutas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;

    try {
      const nueva = await crearTablero({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        fecha_reunion: form.fecha_reunion
      });
      setMinutas(prev => [nueva, ...prev]);
      setModalNueva(false);
      setForm({
        nombre: '',
        descripcion: '',
        fecha_reunion: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      alert(err.message || 'Error al formalizar la minuta');
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar la minuta "${nombre}" y sus acuerdos asociados?`)) {
      return;
    }
    try {
      await eliminarTablero(id);
      setMinutas(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      alert(err.message || 'Error al eliminar la minuta');
    }
  };

  const filtradas = minutas.filter(m =>
    (m.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (m.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Gestión Formal de Minutas
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Registro y centralización de acuerdos formalizados en sesiones de trabajo
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setModalNueva(true)}
          className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Minuta</span>
        </button>
      </div>

      {/* Buscador y Métricas */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="text-xs text-slate-600 dark:text-slate-300">
          <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">{minutas.length}</span> minutas formalizadas en el sistema
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar minutas..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Grid de Minutas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800/50" />
          ))}
        </div>
      ) : filtradas.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0f1523]">
          <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No hay minutas registradas</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Haz clic en "Nueva Minuta" para crear y formalizar una sesión de trabajo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtradas.map(m => (
            <div
              key={m.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                    Minuta #{m.id}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{m.fecha_reunion ? new Date(m.fecha_reunion).toLocaleDateString('es-ES') : 'Sin fecha'}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-1.5">
                  {m.nombre}
                </h3>
                {m.descripcion && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {m.descripcion}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => navigate('/compromisos')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver Acuerdos en Tablero</span>
                </button>

                <button
                  onClick={() => handleEliminar(m.id, m.nombre)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                  title="Eliminar minuta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Nueva Minuta */}
      {modalNueva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Formalizar Nueva Minuta
                </h3>
              </div>
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
                  Nombre de la Minuta <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Minuta #06 - Planificación Estratégica"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Fecha de la Sesión
                </label>
                <input
                  type="date"
                  value={form.fecha_reunion}
                  onChange={(e) => setForm({ ...form, fecha_reunion: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Objetivo o Resumen de Acuerdos
                </label>
                <textarea
                  rows="3"
                  placeholder="Objetivos discutidos y metas acordadas en la sesión..."
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
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
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  Crear Minuta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
