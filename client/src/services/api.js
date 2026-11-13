// ====================================================================
// EasyTask - Cliente de Servicios API
// Sistema de Tareas, Acuerdos y Seguimiento por Semáforos
// ====================================================================

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:5000/api';

/**
 * Obtiene el usuario almacenado en sesión local
 */
export const getCurrentUser = () => {
  if (typeof localStorage === 'undefined') return null;
  const userStr = localStorage.getItem('easytask_user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

/**
 * Verifica si hay una sesión activa
 */
export const isAuthenticated = () => {
  if (typeof localStorage === 'undefined') return false;
  return Boolean(localStorage.getItem('easytask_token'));
};

/**
 * Autentica automáticamente con las credenciales demo predeterminadas si no hay sesión
 */
export const loginAuto = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@easytask.org', password: 'secreto123' })
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('easytask_token', data.token);
        localStorage.setItem('easytask_user', JSON.stringify(data.usuario));
      }
      return data.token;
    }
  } catch (err) {
    console.warn('[API AUTO-LOGIN ERROR]', err.message);
  }
  return '';
};

/**
 * Cliente HTTP autenticado con auto-recuperación de sesión
 */
export const fetchWithAuth = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  let token = typeof localStorage !== 'undefined' ? localStorage.getItem('easytask_token') : null;

  const buildHeaders = (t) => ({
    'Content-Type': 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
    ...(options.headers || {})
  });

  let res = await fetch(url, {
    ...options,
    headers: buildHeaders(token)
  });

  // Si el token expiró (401 o 403), intentar recuperar una vez si era sesión demo
  if (res.status === 401 || res.status === 403) {
    if (typeof localStorage !== 'undefined') {
      const user = getCurrentUser();
      if (user?.email === 'demo@easytask.org') {
        localStorage.removeItem('easytask_token');
        const nuevoToken = await loginAuto();
        if (nuevoToken) {
          res = await fetch(url, {
            ...options,
            headers: buildHeaders(nuevoToken)
          });
        }
      }
    }
  }

  return res;
};

/**
 * Autenticación Manual
 */
export const loginUsuario = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Credenciales inválidas.');
  }
  const data = await res.json();
  if (data.token && typeof localStorage !== 'undefined') {
    localStorage.setItem('easytask_token', data.token);
  }
  if (data.usuario && typeof localStorage !== 'undefined') {
    localStorage.setItem('easytask_user', JSON.stringify(data.usuario));
  }
  return data;
};

/**
 * Registro de nuevo usuario (Desde la pantalla de Login exterior)
 */
export const registrarUsuario = async (datos) => {
  const res = await fetch(`${API_BASE_URL}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'No se pudo completar el registro.');
  }
  const data = await res.json();
  if (data.token && typeof localStorage !== 'undefined') {
    localStorage.setItem('easytask_token', data.token);
  }
  if (data.usuario && typeof localStorage !== 'undefined') {
    localStorage.setItem('easytask_user', JSON.stringify(data.usuario));
  }
  return data;
};

/**
 * Cierre de sesión
 */
export const logoutUsuario = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('easytask_token');
    localStorage.removeItem('easytask_user');
  }
};

/**
 * Compromisos y Tareas
 */
export const getCompromisosPorTablero = async (tableroId) => {
  const id = tableroId || 1;
  const res = await fetchWithAuth(`/tableros/${id}/compromisos`, { method: 'GET' });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: No se pudieron cargar las tareas.`);
  }

  const data = await res.json();
  return Array.isArray(data.compromisos) ? data.compromisos : (Array.isArray(data) ? data : []);
};

export const crearCompromiso = async (datos) => {
  const res = await fetchWithAuth('/compromisos', {
    method: 'POST',
    body: JSON.stringify(datos)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: No se pudo registrar la tarea.`);
  }

  const data = await res.json();
  return data.compromiso || data;
};

export const actualizarEstadoCompromiso = async (compromisoId, nuevoEstado, motivo = '') => {
  const res = await fetchWithAuth(`/compromisos/${compromisoId}/estado`, {
    method: 'PUT',
    body: JSON.stringify({ nuevo_estado: nuevoEstado, motivo })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: No se pudo actualizar el estado.`);
  }

  const data = await res.json();
  return data.compromiso || data;
};

export const actualizarChecklist = async (compromisoId, checklist) => {
  const res = await fetchWithAuth(`/tarjetas/${compromisoId}/checklist`, {
    method: 'PATCH',
    body: JSON.stringify({ checklist })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: No se pudo actualizar el checklist.`);
  }

  return await res.json();
};

export const getHistorialCompromiso = async (compromisoId) => {
  const res = await fetchWithAuth(`/tarjetas/${compromisoId}/historial`, {
    method: 'GET'
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: No se pudo obtener el historial.`);
  }

  return await res.json();
};

export const eliminarCompromiso = async (compromisoId) => {
  const res = await fetchWithAuth(`/tarjetas/${compromisoId}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: No se pudo eliminar la tarea.`);
  }

  return true;
};

/**
 * Tableros / Minutas
 */
export const getTableros = async () => {
  const res = await fetchWithAuth('/tableros', { method: 'GET' });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: No se pudieron cargar las minutas.`);
  }

  return await res.json();
};

export const crearTablero = async (datos) => {
  const body = typeof datos === 'string' ? { nombre: datos } : datos;
  const res = await fetchWithAuth('/tableros', {
    method: 'POST',
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: No se pudo crear la minuta.`);
  }

  return await res.json();
};

export const eliminarTablero = async (tableroId) => {
  const res = await fetchWithAuth(`/tableros/${tableroId}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: No se pudo eliminar la minuta.`);
  }

  return true;
};

/**
 * Directorio y Creación de Usuarios (Dentro del sistema - Logueado)
 */
export const getUsuarios = async () => {
  try {
    const res = await fetchWithAuth('/usuarios', { method: 'GET' });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[API USUARIOS]', err.message);
  }
  return [];
};

export const crearUsuario = async (datos) => {
  // Llama a /auth/registro para persistir el nuevo usuario en la base de datos
  // sin alterar la sesión activa del usuario administrador
  const res = await fetch(`${API_BASE_URL}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: datos.nombre,
      apellido: datos.apellido || '',
      usuario: datos.usuario || datos.email.split('@')[0],
      email: datos.email,
      telefono: datos.telefono || '',
      password: datos.password || 'cambiame123'
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'No se pudo crear el usuario.');
  }

  const data = await res.json();
  return data.usuario;
};
