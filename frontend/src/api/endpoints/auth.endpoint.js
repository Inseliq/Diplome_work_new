import { apiClient } from '../client';

/**
 * POST /api/auth/login
 * Выполняет вход пользователя.
 */
export const login = (body) => apiClient.post('/api/auth/login', body);

/**
 * POST /api/auth/register
 * Регистрирует нового пользователя.
 */
export const register = (body) => apiClient.post('/api/auth/register', body);

/**
 * POST /api/auth/logout
 * Выполняет выход пользователя.
 */
export const logout = () => apiClient.post('/api/auth/logout');

/**
 * POST /api/auth/refresh
 * Обновляет accessToken через refreshToken.
 */
export const refresh = () => apiClient.post('/api/auth/refresh');

/**
 * GET /api/auth/me
 * Возвращает текущего авторизованного пользователя.
 */
export const getCurrentUser = () => apiClient.get('/api/auth/me');