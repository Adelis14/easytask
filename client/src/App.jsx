import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardOverviewPage from './pages/DashboardOverviewPage';
import CompromisosPage from './pages/CompromisosPage';
import ReunionesPage from './pages/ReunionesPage';
import MinutasPage from './pages/MinutasPage';
import UsuariosPage from './pages/UsuariosPage';
import ProyectosPage from './pages/ProyectosPage';
import { isAuthenticated } from './services/api';

/**
 * Componente Guardián de Rutas Privadas:
 * Redirige a /login si no existe sesión activa
 */
function ProtectedRoute({ children }) {
  const location = useLocation();
  const auth = isAuthenticated();

  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      {/* Ruta Pública: Autenticación / Registro */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas Privadas Protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardOverviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compromisos"
        element={
          <ProtectedRoute>
            <CompromisosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reuniones"
        element={
          <ProtectedRoute>
            <ReunionesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/minutas"
        element={
          <ProtectedRoute>
            <MinutasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute>
            <UsuariosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/proyectos"
        element={
          <ProtectedRoute>
            <ProyectosPage />
          </ProtectedRoute>
        }
      />

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
