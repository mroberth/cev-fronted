import { apiClient } from './client.js';

export const apiLogin = (credentials) => {
  return apiClient.post('login', credentials);
};
