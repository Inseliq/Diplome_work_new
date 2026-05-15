import { apiClient } from '../client';

/**
 * GET /api/notification/latest
 * Возвращает последнее активное всплывающее уведомление.
 */
export const getLatestNotification = () => apiClient.get('/api/notification/latest');