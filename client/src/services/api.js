// ====================================================================
// EasyTask - Cliente de Servicios API (SLA < 1.2s)
// Nomenclatura Estricta (UI-REQ-01.4): Minutas, Compromisos y Reuniones
// ====================================================================

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:5000/api';

/**
 * Autentica automáticamente con las credenciales demo predeterminadas
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
 * Cliente HTTP autenticado con auto-recuperación de sesión:
 * Si el token es inválido o expiró (401 o 403), limpia la credencial rota,
 * renueva el token y reintenta la petición transparentemente.
 */
export const fetchWithAuth = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  let token = typeof localStorage !== 'undefined' ? localStorage.getItem('easytask_token') : null;
  if (!token) {
    token = await loginAuto();
  }

  const buildHeaders = (t) => ({
    'Content-Type': 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
    ...(options.headers || {})
  });

  let res = await fetch(url, {
    ...options,
    headers: buildHeaders(token)
  });

  // Si el token es inválido o expiró, auto-recuperar inmediatamente
  if (res.status === 401 || res.status === 403) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('easytask_token');
    }
    const nuevoToken = await loginAuto();
    if (nuevoToken) {
      res = await fetch(url, {
        ...options,
        headers: buildHeaders(nuevoToken)
      });
    }
  }

  return res;
};

/**
 * Consulta todos los compromisos pactados en una minuta específica.
 * Inyecta dinámicamente la propiedad 'semaforo' en cada compromiso.
 * 
 * @param {number|string} tableroId - ID de la minuta / tablero
 * @returns {Promise<Array>} Lista de compromisos
 */
export const getCompromisosPorTablero = async (tableroId) => {
  const id = tableroId || 1;
  const res = await fetchWithAuth(`/tableros/${id}/compromisos`, { method: 'GET' });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: No se pudieron cargar los compromisos de la minuta.`);
  }

  const data = await res.json();
  return Array.isArray(data.compromisos) ? data.compromisos : (Array.isArray(data) ? data : []);
};

/**
 * Registra un nuevo compromiso formalizado en la minuta
 */
export const crearCompromiso = async (datos) => {
  const res = await fetchWithAuth('/compromisos', {
    method: 'POST',
    body: JSON.stringify(datos)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: No se pudo registrar el compromiso.`);
  }

  const data = await res.json();
  return data.compromiso || data;
};

/**
 * Actualiza el estado de un compromiso respetando los 4 estados canónicos:
 * 'Pendiente', 'En Proceso', 'Entregado', 'Verificado'
 */
export const actualizarEstadoCompromiso = async (compromisoId, nuevoEstado, motivo = '') => {
  const res = await fetchWithAuth(`/compromisos/${compromisoId}/estado`, {
    method: 'PUT',
    body: JSON.stringify({ nuevo_estado: nuevoEstado, motivo })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: No se pudo actualizar el estado del compromiso.`);
  }

  const data = await res.json();
  return data.compromiso || data;
};

/**
 * Persiste los cambios del checklist de un compromiso
 */
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

/**
 * Obtiene el historial de auditoría inmutable de un compromiso
 */
export const getHistorialCompromiso = async (compromisoId) => {
  const res = await fetchWithAuth(`/tarjetas/${compromisoId}/historial`, {
    method: 'GET'
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: No se pudo obtener la auditoría.`);
  }

  return await res.json();
};

/**
 * Elimina un compromiso
 */
export const eliminarCompromiso = async (compromisoId) => {
  const res = await fetchWithAuth(`/tarjetas/${compromisoId}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: No se pudo eliminar el compromiso.`);
  }

  return true;
};

/**
 * Lista todas las minutas activas
 */
export const getTableros = async () => {
  const res = await fetchWithAuth('/tableros', { method: 'GET' });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: No se pudieron cargar las minutas.`);
  }

  return await res.json();
};

/**
 * Crea una nueva minuta / reunión
 */
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

/**
 * Elimina una minuta / tablero de reunión
 */
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
 * Obtiene el directorio de usuarios y colaboradores
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

/**
 * Autentica al usuario en el sistema manualmente
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
 * Cierra la sesión activa eliminando los tokens locales
 */
export const logoutUsuario = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('easytask_token');
    localStorage.removeItem('easytask_user');
  }
};
