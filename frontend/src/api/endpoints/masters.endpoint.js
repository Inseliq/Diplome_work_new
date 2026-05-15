import { apiClient } from '../client';

/**
 * GET /api/masters
 * Возвращает готовые данные знаков классности из backend-БД.
 */
export const getMasters = () => apiClient.get('/api/masters');