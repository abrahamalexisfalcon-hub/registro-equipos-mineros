import api from './axios';

const BASE = '/api/v1/equipos';
const BASE_TIPOS = '/api/v1/tipos-equipo';

export const checkHealth = async () => (await api.get('/health')).data;

export const listarEquipos = async () => (await api.get(BASE)).data;

export const crearEquipo = async ({ codigo, tipoId, horometroInicial }) =>
  (await api.post(BASE, { codigo, tipoId, horometroInicial })).data;

export const actualizarHorometro = async (id, horometro) =>
  (await api.put(`${BASE}/${id}/horometro`, { horometro })).data;

export const registrarMantenimiento = async (id, { nombreTecnico, observaciones }) =>
  (await api.post(`${BASE}/${id}/mantenimiento`, { nombreTecnico, observaciones })).data;

export const obtenerHistorial = async (id) => (await api.get(`${BASE}/${id}/historial`)).data;

export const eliminarEquipo = async (id) => {
  await api.delete(`${BASE}/${id}`);
};

export const listarTiposEquipo = async () => (await api.get(BASE_TIPOS)).data;

export const crearTipoEquipo = async ({ nombre, intervaloHorasMantenimiento, descripcion }) =>
  (await api.post(BASE_TIPOS, { nombre, intervaloHorasMantenimiento, descripcion })).data;
