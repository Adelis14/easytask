import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  RotateCcw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  History,
  X,
  Calendar,
  Check,
  User,
  ArrowRight
} from 'lucide-react';
import {
  getTableros,
  getCompromisosPorTablero,
  crearCompromiso,
  actualizarEstadoCompromiso,
  actualizarChecklist,
  getHistorialCompromiso,
  getUsuarios
} from '../services/api';

// Configuración de Columnas de Flujo Visual
const COLUMNAS_FLUJO = [
  {
    id: 'Rojo',
    titulo: 'Iniciado / Urgente',
    estadosValidos: ['Iniciado', 'Pendiente'],
    estadoDefecto: 'Iniciado',
    colorHex: '#EF4444',
    badgeClass: 'bg-red-50 text-red-700 dark:bg-red-950/80 dark:text-red-300 border-red-200 dark:border-red-900',
    dotClass: 'bg-red-500 ring-2 ring-red-300 dark:ring-red-900',
    descripcion: 'Tareas iniciadas o de atención urgente'
  },
  {
    id: 'Amarillo',
    titulo: 'En Proceso',
    estadosValidos: ['En Proceso'],
    estadoDefecto: 'En Proceso',
    colorHex: '#F59E0B',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    dotClass: 'bg-amber-500 ring-2 ring-amber-300 dark:ring-amber-900',
    descripcion: 'Tareas con trabajo activo en curso'
  },
  {
    id: 'Verde',
    titulo: 'Listo',
    estadosValidos: ['Listo', 'Entregado', 'Verificado'],
    estadoDefecto: 'Listo',
    colorHex: '#10B981',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
    dotClass: 'bg-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-900',
    descripcion: 'Tareas concluidas, validadas y listas'
  }
];

export default function CompromisosPage() {
  const [minutas, setMinutas] = useState([]);
  const [minutaActivaId, setMinutaActivaId] = useState(1);
  const [compromisos, setCompromisos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroColor, setFiltroColor] = useState('todos');
  const [tabTabletActiva, setTabTabletActiva] = useState('Rojo');
  const [acordeonesAbiertos, setAcordeonesAbiertos] = useState({
    Rojo: true,
    Amarillo: true,
    Verde: true
  });

  // Modales
  const [modalNuevoCompromiso, setModalNuevoCompromiso] = useState(false);
  const [modalHistorial, setModalHistorial] = useState(false);
  const [historialItems, setHistorialItems] = useState([]);
  const [compromisoHistorial, setCompromisoHistorial] = useState(null);

  // Formulario nuevo compromiso
  const [formCompromiso, setFormCompromiso] = useState({
    nombre: '',
    descripcion: '',
    responsable: '',
    fecha_vencimiento: '',
    estado: 'Iniciado',
    checklistRaw: ''
  });

  useEffect(() => {
    cargarInicial();
  }, []);

  useEffect(() => {
    if (minutaActivaId) {
      cargarCompromisos(minutaActivaId);
    }
  }, [minutaActivaId]);

  const cargarInicial = async () => {
    try {
      const [tabs, usrs] = await Promise.all([
        getTableros().catch(() => []),
        getUsuarios().catch(() => [])
      ]);
      setMinutas(tabs);
      setUsuarios(usrs);
      if (tabs.length > 0) {
        setMinutaActivaId(tabs[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cargarCompromisos = async (tableroId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCompromisosPorTablero(tableroId);
      setCompromisos(data);
    } catch (err) {
      setError(err.message || 'Error al conectar con la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  // Clasificador de color de tarea
  const obtenerColorDeTarea = (c) => {
    const est = (c.estado || '').toLowerCase();
    if (est === 'listo' || est === 'verificado' || est === 'entregado') return 'Verde';
    if (est === 'en proceso') return 'Amarillo';
    return 'Rojo'; // Iniciado / Pendiente / Urgente
  };

  // Filtrado reactivo
  const tareasFiltradas = useMemo(() => {
    return compromisos.filter((c) => {
      const col = obtenerColorDeTarea(c);
      if (filtroColor !== 'todos' && col.toLowerCase() !== filtroColor.toLowerCase()) {
        return false;
      }
      if (busqueda.trim()) {
        const query = busqueda.toLowerCase();
        const coincideNombre = (c.titulo || c.nombre || '').toLowerCase().includes(query);
        const coincideResponsable = (c.responsable || '').toLowerCase().includes(query);
        const coincideDesc = (c.descripcion || '').toLowerCase().includes(query);
        return coincideNombre || coincideResponsable || coincideDesc;
      }
      return true;
    });
  }, [compromisos, filtroColor, busqueda]);

  // Agrupación por las 3 columnas
  const porColumna = useMemo(() => {
    const mapa = { Rojo: [], Amarillo: [], Verde: [] };
    tareasFiltradas.forEach((c) => {
      const col = obtenerColorDeTarea(c);
      if (mapa[col]) {
        mapa[col].push(c);
      } else {
        mapa.Rojo.push(c);
      }
    });
    return mapa;
  }, [tareasFiltradas]);

  // Manejo de cambio de estado
  const handleCambioEstado = async (compromisoId, nuevoEstado) => {
    try {
      const actualizado = await actualizarEstadoCompromiso(compromisoId, nuevoEstado, `Cambio a ${nuevoEstado}`);
      setCompromisos(prev =>
        prev.map(c => c.id === compromisoId ? { ...c, estado: nuevoEstado, fecha_culminacion: actualizado.fecha_culminacion } : c)
      );
    } catch (err) {
      alert(err.message || 'Error al actualizar el estado de la tarea');
    }
  };

  // Manejo de checklist
  const handleToggleChecklist = async (compromiso, itemIndex) => {
    const checklistActual = Array.isArray(compromiso.checklist) ? [...compromiso.checklist] : [];
    if (!checklistActual[itemIndex]) return;

    checklistActual[itemIndex] = {
      ...checklistActual[itemIndex],
      completed: !checklistActual[itemIndex].completed
    };

    try {
      await actualizarChecklist(compromiso.id, checklistActual);
      setCompromisos(prev =>
        prev.map(c => c.id === compromiso.id ? { ...c, checklist: checklistActual } : c)
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Ver historial
  const handleVerHistorial = async (compromiso) => {
    setCompromisoHistorial(compromiso);
    setModalHistorial(true);
    try {
      const historial = await getHistorialCompromiso(compromiso.id);
      setHistorialItems(historial);
    } catch (err) {
      console.error(err);
      setHistorialItems([]);
    }
  };

  // Crear nueva tarea
  const handleCrearCompromiso = async (e) => {
    e.preventDefault();
    if (!formCompromiso.nombre.trim()) return;

    const checklistItems = formCompromiso.checklistRaw
      ? formCompromiso.checklistRaw
          .split('\n')
          .filter(l => l.trim())
          .map((text, i) => ({ id: i + 1, text: text.trim(), completed: false }))
      : [];

    try {
      const nuevo = await crearCompromiso({
        tablero_id: minutaActivaId,
        nombre: formCompromiso.nombre.trim(),
        descripcion: formCompromiso.descripcion.trim(),
        responsable: formCompromiso.responsable.trim(),
        fecha_vencimiento: formCompromiso.fecha_vencimiento || null,
        estado: formCompromiso.estado,
        checklist: checklistItems
      });

      setCompromisos(prev => [nuevo, ...prev]);
      setModalNuevoCompromiso(false);
      setFormCompromiso({
        nombre: '',
        descripcion: '',
        responsable: '',
        fecha_vencimiento: '',
        estado: 'Iniciado',
        checklistRaw: ''
      });
    } catch (err) {
      alert(err.message || 'Error al registrar la tarea');
    }
  };

  const totalesPorColor = useMemo(() => {
    let r = 0, y = 0, g = 0;
    compromisos.forEach(c => {
      const col = obtenerColorDeTarea(c);
      if (col === 'Rojo') r++;
      else if (col === 'Amarillo') y++;
      else if (col === 'Verde') g++;
    });
    return { r, y, g };
  }, [compromisos]);

  return (
    <div className="space-y-6">
      {/* Encabezado y Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Tablero de Tareas
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Flujo visual: 🔴 Rojo (Iniciado) · 🟡 Amarillo (En Proceso) · 🟢 Verde (Listo)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Selector de Minuta/Lista */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Minuta:</span>
            <select
              value={minutaActivaId}
              onChange={(e) => setMinutaActivaId(Number(e.target.value))}
              className="py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {minutas.map(m => (
                <option key={m.id} value={m.id}>
                  #{m.id} - {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setModalNuevoCompromiso(true)}
            className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nueva Tarea</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Botones de Filtro por Color */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold mr-1">Filtrar:</span>
          <button
            onClick={() => setFiltroColor('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              filtroColor === 'todos'
                ? 'bg-slate-900 dark:bg-slate-700 text-white border-slate-900 dark:border-slate-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            Todas ({compromisos.length})
          </button>

          <button
            onClick={() => setFiltroColor('rojo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
              filtroColor === 'rojo'
                ? 'bg-red-500 text-white border-red-500 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-red-600 border-red-200 dark:border-red-900/60 hover:bg-red-50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-300" />
            <span>Rojo ({totalesPorColor.r})</span>
          </button>

          <button
            onClick={() => setFiltroColor('amarillo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
              filtroColor === 'amarillo'
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-amber-600 border-amber-200 dark:border-amber-900/60 hover:bg-amber-50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-300" />
            <span>Amarillo ({totalesPorColor.y})</span>
          </button>

          <button
            onClick={() => setFiltroColor('verde')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
              filtroColor === 'verde'
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-emerald-600 border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-300" />
            <span>Verde ({totalesPorColor.g})</span>
          </button>
        </div>

        {/* Buscador */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por tarea o responsable..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Renderizado de Columnas */}
      {error ? (
        <div className="p-6 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <h2 className="text-sm font-bold text-red-900 dark:text-white">No se pudieron cargar las tareas</h2>
              <p className="text-xs text-red-700 dark:text-red-200 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={() => cargarCompromisos(minutaActivaId)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reintentar</span>
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800/50" />
          ))}
        </div>
      ) : (
        <>
          {/* VISTA DESKTOP (3 Columnas de Flujo Visual) */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-5 items-start">
            {COLUMNAS_FLUJO.map((col) => {
              const items = porColumna[col.id] || [];

              return (
                <div
                  key={col.id}
                  className="bg-white dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-xs hover:shadow-md transition-shadow"
                >
                  {/* Cabecera Columna */}
                  <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/40">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3.5 h-3.5 rounded-full ${col.dotClass}`} />
                      <div>
                        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{col.titulo}</span>
                        </h2>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          {col.descripcion}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${col.badgeClass}`}>
                      {items.length}
                    </span>
                  </div>

                  {/* Tarjetas */}
                  <div className="p-3.5 space-y-3 min-h-[460px] max-h-[calc(100vh-20rem)] overflow-y-auto">
                    {items.length === 0 ? (
                      <div className="h-36 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-4 text-center text-xs text-slate-400">
                        <span>Sin tareas en {col.titulo}</span>
                        <span className="text-[10px] text-slate-400 mt-1">Haz clic en "+ Nueva Tarea" para agregar una</span>
                      </div>
                    ) : (
                      items.map((c) => (
                        <TarjetaTareaItem
                          key={c.id}
                          compromiso={c}
                          colorActual={col.id}
                          onCambioEstado={handleCambioEstado}
                          onToggleChecklist={handleToggleChecklist}
                          onVerHistorial={handleVerHistorial}
                        />
                      ))
                    )}
                  </div>

                  {/* Footer Columna */}
                  <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setFormCompromiso(prev => ({ ...prev, estado: col.estadoDefecto }));
                        setModalNuevoCompromiso(true);
                      }}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar en {col.titulo}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* VISTA TABLET (Tabs de Estados + Grid) */}
          <div className="hidden md:block lg:hidden space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {COLUMNAS_FLUJO.map((col) => {
                const activo = tabTabletActiva === col.id;
                const items = porColumna[col.id] || [];
                return (
                  <button
                    key={col.id}
                    onClick={() => setTabTabletActiva(col.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                      activo
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotClass}`} />
                    <span>{col.titulo} ({items.length})</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(porColumna[tabTabletActiva] || []).map(c => (
                <TarjetaTareaItem
                  key={c.id}
                  compromiso={c}
                  colorActual={tabTabletActiva}
                  onCambioEstado={handleCambioEstado}
                  onToggleChecklist={handleToggleChecklist}
                  onVerHistorial={handleVerHistorial}
                />
              ))}
            </div>
          </div>

          {/* VISTA MÓVIL (Acordeones Táctiles) */}
          <div className="md:hidden space-y-3 pb-12">
            {COLUMNAS_FLUJO.map((col) => {
              const items = porColumna[col.id] || [];
              const abierto = acordeonesAbiertos[col.id];

              return (
                <div
                  key={col.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0f1523] overflow-hidden shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setAcordeonesAbiertos(prev => ({ ...prev, [col.id]: !prev[col.id] }))}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-slate-50 dark:bg-slate-900/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-full ${col.dotClass}`} />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        {col.titulo} ({items.length})
                      </span>
                    </div>
                    {abierto ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {abierto && (
                    <div className="p-3 space-y-3">
                      {items.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                          Sin tareas registradas
                        </div>
                      ) : (
                        items.map(c => (
                          <TarjetaTareaItem
                            key={c.id}
                            compromiso={c}
                            colorActual={col.id}
                            onCambioEstado={handleCambioEstado}
                            onToggleChecklist={handleToggleChecklist}
                            onVerHistorial={handleVerHistorial}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal: Nueva Tarea */}
      {modalNuevoCompromiso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Nueva Tarea / Compromiso
              </h3>
              <button
                onClick={() => setModalNuevoCompromiso(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearCompromiso} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre de la Tarea <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Revisar informe de acuerdos semanales"
                  value={formCompromiso.nombre}
                  onChange={(e) => setFormCompromiso({ ...formCompromiso, nombre: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción o Criterios
                </label>
                <textarea
                  rows="2"
                  placeholder="Detalles sobre lo que se debe realizar..."
                  value={formCompromiso.descripcion}
                  onChange={(e) => setFormCompromiso({ ...formCompromiso, descripcion: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={formCompromiso.estado}
                    onChange={(e) => setFormCompromiso({ ...formCompromiso, estado: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer font-semibold"
                  >
                    <option value="Iniciado">🔴 Rojo - Iniciado / Urgente</option>
                    <option value="En Proceso">🟡 Amarillo - En Proceso</option>
                    <option value="Listo">🟢 Verde - Listo / Completado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Responsable
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Valeria Soto"
                    value={formCompromiso.responsable}
                    onChange={(e) => setFormCompromiso({ ...formCompromiso, responsable: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Fecha Límite
                </label>
                <input
                  type="date"
                  value={formCompromiso.fecha_vencimiento}
                  onChange={(e) => setFormCompromiso({ ...formCompromiso, fecha_vencimiento: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subtareas / Puntos de Control (Uno por línea)
                </label>
                <textarea
                  rows="3"
                  placeholder="Punto 1&#10;Punto 2&#10;Punto 3"
                  value={formCompromiso.checklistRaw}
                  onChange={(e) => setFormCompromiso({ ...formCompromiso, checklistRaw: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNuevoCompromiso(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Historial */}
      {modalHistorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Historial de Cambios
                </h3>
              </div>
              <button
                onClick={() => setModalHistorial(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 font-semibold">
              Tarea: {compromisoHistorial?.titulo || compromisoHistorial?.nombre}
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {historialItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Sin registros previos de cambios de estado.
                </div>
              ) : (
                historialItems.map((h, i) => (
                  <div
                    key={h.id || i}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>{h.estado_anterior || 'Inicio'} → <span className="text-blue-600 dark:text-blue-400">{h.estado_nuevo}</span></span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {new Date(h.fecha || h.fecha_cambio).toLocaleString('es-ES')}
                      </span>
                    </div>
                    {h.descripcion && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                        {h.descripcion}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tarjeta Individual con Círculo y Select de Color
function TarjetaTareaItem({ compromiso, colorActual, onCambioEstado, onToggleChecklist, onVerHistorial }) {
  const [expandido, setExpandido] = useState(false);
  const checklist = Array.isArray(compromiso.checklist) ? compromiso.checklist : [];
  const completados = checklist.filter(i => i.completed).length;

  const dotClasses = {
    Rojo: 'bg-red-500 ring-2 ring-red-300 dark:ring-red-900',
    Amarillo: 'bg-amber-500 ring-2 ring-amber-300 dark:ring-amber-900',
    Verde: 'bg-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-900'
  };

  const colorLabels = {
    Rojo: 'Rojo (Iniciado)',
    Amarillo: 'Amarillo (En Proceso)',
    Verde: 'Verde (Listo)'
  };

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#131927] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          ID #{compromiso.id}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-full ${dotClasses[colorActual]}`} />
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
            {colorLabels[colorActual] || colorActual}
          </span>
        </div>
      </div>

      {/* Titulo */}
      <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
        {compromiso.titulo || compromiso.nombre}
      </h3>

      {compromiso.descripcion && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {compromiso.descripcion}
        </p>
      )}

      {/* Responsable & Fecha */}
      <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5 truncate">
          <User className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{compromiso.responsable || 'Sin asignar'}</span>
        </div>
        {compromiso.fecha_vencimiento && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>Límite: {new Date(compromiso.fecha_vencimiento).toLocaleDateString('es-ES')}</span>
          </div>
        )}
      </div>

      {/* Subtareas */}
      {checklist.length > 0 && (
        <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => setExpandido(prev => !prev)}
            className="w-full flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-semibold hover:text-blue-500 cursor-pointer"
          >
            <span>Subtareas ({completados}/{checklist.length})</span>
            {expandido ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {expandido && (
            <div className="space-y-1.5 pt-1 pl-1">
              {checklist.map((item, idx) => (
                <label key={idx} className="flex items-center gap-2 text-[11px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(item.completed)}
                    onChange={() => onToggleChecklist(compromiso, idx)}
                    className="rounded text-blue-600"
                  />
                  <span className={item.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Círculo indicador + Select para cambiar de color/estado */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Círculo del color activo */}
          <span className={`w-3 h-3 rounded-full ${dotClasses[colorActual]} shrink-0`} />

          {/* Select desplegable con los colores */}
          <select
            value={colorActual}
            onChange={(e) => {
              const val = e.target.value;
              const nuevoEstado = val === 'Rojo' ? 'Iniciado' : (val === 'Amarillo' ? 'En Proceso' : 'Listo');
              onCambioEstado(compromiso.id, nuevoEstado);
            }}
            className="text-xs font-semibold py-1 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Rojo">🔴 Rojo - Iniciado</option>
            <option value="Amarillo">🟡 Amarillo - En Proceso</option>
            <option value="Verde">🟢 Verde - Listo</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => onVerHistorial(compromiso)}
          title="Ver historial de cambios"
          className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
        >
          <History className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
