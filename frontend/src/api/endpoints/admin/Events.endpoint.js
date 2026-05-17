import { apiClient } from '../../client';

/**
 * GET /api/admin/events
 */
export const getAdminEvents = () =>
  apiClient.get('/api/admin/events');

/**
 * GET /api/admin/events/:id
 */
export const getAdminEventById = (id) =>
  apiClient.get(`/api/admin/events/${id}`);

/**
 * POST /api/admin/events
 */
export const createAdminEvent = (body) =>
  apiClient.post('/api/admin/events', body);

/**
 * PUT /api/admin/events/:id
 */
export const updateAdminEvent = (id, body) =>
  apiClient.put(`/api/admin/events/${id}`, body);

/**
 * PUT /api/admin/events/:id/publish?value=true|false
 */
export const setAdminEventPublished = (id, value) =>
  apiClient.put(`/api/admin/events/${id}/publish?value=${value}`);

/**
 * DELETE /api/admin/events/:id
 */
export const deleteAdminEvent = (id) =>
  apiClient.delete(`/api/admin/events/${id}`);