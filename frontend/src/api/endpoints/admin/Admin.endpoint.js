import { apiClient } from '../../client';

/**
 * GET /api/admin/dashboard
 * Возвращает структуру главной страницы админ-панели.
 */
export const getAdminDashboard = () => apiClient.get('/api/admin/dashboard');