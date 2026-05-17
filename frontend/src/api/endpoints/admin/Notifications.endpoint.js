import { apiClient } from '../../client';

/**
 * GET /api/admin/notifications
 */
export const getAdminNotifications = () =>
  apiClient.get('/api/admin/notifications');

/**
 * POST /api/admin/notifications
 */
export const createAdminNotification = (body) =>
  apiClient.post('/api/admin/notifications', body);

/**
 * PUT /api/admin/notifications/:id/publish?value=true|false
 */
export const setAdminNotificationPublished = (id, value) =>
  apiClient.put(`/api/admin/notifications/${id}/publish?value=${value}`);

/**
 * DELETE /api/admin/notifications/:id
 */
export const deleteAdminNotification = (id) =>
  apiClient.delete(`/api/admin/notifications/${id}`);