import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

/**
 * Extrae un mensaje legible desde un error de Axios usando el formato
 * del GlobalExceptionHandler del backend: { status, message, timestamp, errores }.
 */
export function extraerMensajeError(error) {
  if (!error?.response) {
    return 'No se pudo conectar con el servidor. Verifique que el backend esté en línea.';
  }
  const { data } = error.response;
  if (data?.errores && typeof data.errores === 'object') {
    const detalles = Object.values(data.errores).join('. ');
    if (detalles) return detalles;
  }
  return data?.message || `Error inesperado (HTTP ${error.response.status}).`;
}

export default api;
