import { apiClient } from '../client';

/**
 * GET /api/marks
 * Возвращает готовые данные отметок из backend-БД.
 */
export const getMarks = () => apiClient.get('/api/marks');