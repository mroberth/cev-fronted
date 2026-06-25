import { apiClient } from './client.js';

export const listarUsuarios = () => {
  return apiClient.get('usuarios');
};

export const crearUsuario = (data) => {
  return apiClient.post('usuarios', data);
};

export const listarRoles = () => {
  return apiClient.get('usuarios/roles');
};
