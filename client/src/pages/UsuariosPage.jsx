import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Search,
  Plus,
  X,
  UserPlus,
  UserCheck,
  Lock,
  User
} from 'lucide-react';
import { getUsuarios, getTableros, getCompromisosPorTablero, crearUsuario } from '../services/api';

export default function UsuariosPage() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [compromisos, setCompromisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // Modal para crear usuario dentro del sistema
  const [modalNuevoUsuario, setModalNuevoUsuario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');
  const [formUsuario, setFormUsuario] = useState({
    nombre: '',
    apellido: '',
    usuario: '',
    email: '',
    telefono: '',
    password: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [usrs, tabs] = await Promise.all([
        getUsuarios().catch(() => []),
        getTableros().catch(() => [])
      ]);
      setUsuarios(usrs);

      if (tabs.length > 0) {
        const comps = await getCompromisosPorTablero(tabs[0].id).catch(() => []);
        setCompromisos(comps);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (nombre) => {
    if (!nombre) return 'U';
    return nombre
      .split(' ')
      .filter(Boolean)
      .map(p => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    setErrorModal('');
    if (!formUsuario.nombre.trim() || !formUsuario.email.trim()) {
      setErrorModal('El nombre y correo electrónico son obligatorios.');
      return;
    }

    setGuardando(true);
    try {
      const nuevo = await crearUsuario({
        nombre: formUsuario.nombre.trim(),
        apellido: formUsuario.apellido.trim(),
        usuario: formUsuario.usuario.trim() || formUsuario.email.split('@')[0],
        email: formUsuario.email.trim(),
        telefono: formUsuario.telefono.trim(),
        password: formUsuario.password || 'cambiame123'
      });

      setUsuarios(prev => [...prev, nuevo]);
      setModalNuevoUsuario(false);
      setFormUsuario({
        nombre: '',
        apellido: '',
        usuario: '',
        email: '',
        telefono: '',
        password: ''
      });
    } catch (err) {
      setErrorModal(err.message || 'Error al registrar el colaborador.');
    } finally {
      setGuardando(false);
    }
  };

  // Clasificador cromático
  const obtenerColor = (c) => {
    const est = (c.estado || '').toLowerCase();
    if (est === 'listo' || est === 'verificado' || est === 'entregado') return 'Verde';
    if (est === 'en proceso') return 'Amarillo';
    return 'Rojo';
  };

  // Calcular métricas individuales
  const colaboradores = usuarios.map(u => {
    const nombreLower = (u.nombre || '').toLowerCase();
    const asignados = compromisos.filter(c =>
      (c.responsable || '').toLowerCase().includes(nombreLower) ||
      (c.responsable || '').toLowerCase().includes((u.usuario || '').toLowerCase())
    );

    const totalAsignados = asignados.length;
    const cumplidos = asignados.filter(c => obtenerColor(c) === 'Verde').length;
    const rojos = asignados.filter(c => obtenerColor(c) === 'Rojo').length;
    const tasa = totalAsignados > 0 ? Math.round((cumplidos / totalAsignados) * 100) : 100;

    return {
      ...u,
      totalAsignados,
      cumplidos,
      rojos,
      tasa,
      asignados
    };
  });

  const filtrados = colaboradores.filter(u =>
    (u.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (u.usuario || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Directorio de Usuarios y Colaboradores
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gestión del equipo, asignación de tareas y registro de nuevos usuarios
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => { setErrorModal(''); setModalNuevoUsuario(true); }}
            className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 active:scale-95 shadow-md shadow-purple-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Buscador y Resumen */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">{usuarios.length}</span> miembros registrados en el equipo
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nombre, usuario o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Directorio de Colaboradores */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-48 rounded-3xl bg-slate-200 dark:bg-slate-800/50" />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0f1523]">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No se encontraron colaboradores</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Haz clic en "+ Nuevo Usuario" para dar de alta a un miembro del equipo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtrados.map(colab => (
            <div
              key={colab.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-purple-500/20">
                      {getInitials(colab.nombre)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {colab.nombre} {colab.apellido || ''}
                      </h3>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                        @{colab.usuario || 'usuario'}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                    {colab.totalAsignados} tareas
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 mb-4">
                  {colab.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{colab.email}</span>
                    </div>
                  )}
                  {colab.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{colab.telefono}</span>
                    </div>
                  )}
                </div>

                {/* Métricas de Cumplimiento */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131927] border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Tasa de Conclusión</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{colab.tasa}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${colab.tasa}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-center">
                    <div>
                      <span className="text-slate-400 block">Total</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{colab.totalAsignados}</span>
                    </div>
                    <div>
                      <span className="text-emerald-600 dark:text-emerald-400 block font-semibold">Listas</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{colab.cumplidos}</span>
                    </div>
                    <div>
                      <span className="text-red-500 block font-semibold">En Rojo</span>
                      <span className="font-bold text-red-500 font-mono">{colab.rojos}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => navigate('/compromisos')}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Ver tareas en el Tablero</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Crear Usuario Dentro del Sistema */}
      {modalNuevoUsuario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Registrar Nuevo Colaborador
                </h3>
              </div>
              <button
                onClick={() => setModalNuevoUsuario(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorModal && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-2 text-xs text-red-600 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorModal}</span>
              </div>
            )}

            <form onSubmit={handleCrearUsuario} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Valeria"
                    value={formUsuario.nombre}
                    onChange={(e) => setFormUsuario({ ...formUsuario, nombre: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Soto"
                    value={formUsuario.apellido}
                    onChange={(e) => setFormUsuario({ ...formUsuario, apellido: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre de Usuario (Login)
                </label>
                <input
                  type="text"
                  placeholder="Ej. vsoto"
                  value={formUsuario.usuario}
                  onChange={(e) => setFormUsuario({ ...formUsuario, usuario: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="valeria.soto@empresa.com"
                  value={formUsuario.email}
                  onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teléfono (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="+58 412 0000000"
                  value={formUsuario.telefono}
                  onChange={(e) => setFormUsuario({ ...formUsuario, telefono: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contraseña Inicial
                </label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres (o dejar en blanco para cambiame123)"
                  value={formUsuario.password}
                  onChange={(e) => setFormUsuario({ ...formUsuario, password: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNuevoUsuario(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {guardando ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
