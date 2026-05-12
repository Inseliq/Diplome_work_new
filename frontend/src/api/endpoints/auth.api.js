import { apiClient } from '../client';

export const authApi = {
  login: (body) => apiClient.post('/api/auth/login', body),

  register: (body) => apiClient.post('/api/auth/register', body),

  logout: () => apiClient.post('/api/auth/logout'),

  refresh: () => apiClient.post('/api/auth/refresh'),

  me: () => apiClient.get('/api/auth/me'),
};