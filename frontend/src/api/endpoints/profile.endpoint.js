import { apiClient } from '../client';

/**
 * GET /api/profile
 * Возвращает профиль текущего пользователя.
 */
export const getProfile = () => apiClient.get('/api/profile');

/**
 * POST /api/profile/change-password
 * Меняет пароль текущего пользователя.
 */
export const changeProfilePassword = (body) =>
  apiClient.post('/api/profile/change-password', body);

/**
 * POST /api/profile/leave-clan
 * Позволяет пользователю покинуть клан.
 */
export const leaveClan = () => apiClient.post('/api/profile/leave-clan');

/**
 * GET /api/profile/my-clan
 * Возвращает клан текущего пользователя.
 */
export const getMyClan = () => apiClient.get('/api/profile/my-clan');