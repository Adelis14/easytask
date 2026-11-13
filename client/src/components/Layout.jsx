import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckCircle2,
  Calendar,
  FileText,
  Users,
  Briefcase,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Bell,
  Check,
  ChevronRight
} from 'lucide-react';
import { getCurrentUser, logoutUsuario } from '../services/api';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, desc: 'Métricas y resumen' },
  { path: '/compromisos', label: 'Tareas', icon: CheckCircle2, desc: 'Flujo visual de tareas' },
  { path: '/reuniones', label: 'Reuniones', icon: Calendar, desc: 'Sesiones y agenda' },
  { path: '/minutas', label: 'Minutas', icon: FileText, desc: 'Actas y acuerdos' },
  { path: '/usuarios', label: 'Usuarios', icon: Users, desc: 'Directorio del equipo' },
  { path: '/proyectos', label: 'Proyectos', icon: Briefcase, desc: 'Iniciativas globales' }
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    setUser(getCurrentUser());
  }, [location.pathname]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logoutUsuario();
    navigate('/login');
  };

  const getInitials = (nombre) => {
    if (!nombre) return 'ET';
    return nombre
      .split(' ')
      .filter(Boolean)
      .map(p => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-[#0f1523] border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand con Logo Check */}
        <div className="h-20 px-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white block leading-none">
                Easy<span className="text-blue-600 dark:text-blue-400">Task</span>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide mt-1 block">
                Gestión de Tareas
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          <div className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navegación del Sistema
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60 shadow-xs font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold leading-snug">{item.label}</span>
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400 block mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              </NavLink>
            );
          })}
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0c111c]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                {getInitials(user?.nombre)}
              </div>
              <div className="truncate">
                <span className="text-sm font-bold text-slate-900 dark:text-white block truncate leading-tight">
                  {user?.nombre || 'Usuario Demo'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                  {user?.email || 'demo@easytask.org'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        {/* Top Navbar */}
        <header className="h-20 sticky top-0 z-30 bg-white/80 dark:bg-[#0f1523]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Sistema Integral de Gestión y Control de Tareas
              </h1>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Sistema activo y sincronizado en tiempo real
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(prev => !prev)}
              aria-label="Alternar tema visual"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-slate-700" />}
            </button>

            {/* Notification */}
            <div className="relative">
              <button
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Notificaciones"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
