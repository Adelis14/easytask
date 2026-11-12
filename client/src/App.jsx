import React, { useState } from 'react';
import DashboardPage from './pages/DashboardPage';
import Toast from './components/Toast';

/**
 * EasyTask - Aplicación Principal
 * Encapsula DashboardPage con un contenedor principal responsivo
 * con soporte dinámico para Modo Claro y Modo Oscuro, y notificaciones Toast.
 */
export default function App() {
  const [toast, setToast] = useState(null);

  const handleNotify = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#080c14] text-zinc-900 dark:text-[#f0f4ff] w-full flex flex-col font-sans antialiased transition-colors duration-200">
      {/* Contenedor principal responsivo encapsulando DashboardPage */}
      <DashboardPage onNotificar={handleNotify} />

      {/* Componente Toast para confirmación de acciones sin interrumpir el flujo */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
