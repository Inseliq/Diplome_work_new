import { apiClient } from '../../client';

/**
 * GET /api/admin/news
 */
export const getAdminNews = () =>
  apiClient.get('/api/admin/news');

/**
 * GET /api/admin/news/:id
 */
export const getAdminNewsById = (id) =>
  apiClient.get(`/api/admin/news/${id}`);

/**
 * POST /api/admin/news
 */
export const createAdminNews = (body) =>
  apiClient.post('/api/admin/news', body);

/**
 * PUT /api/admin/news/:id
 */
export const updateAdminNews = (id, body) =>
  apiClient.put(`/api/admin/news/${id}`, body);

/**
 * PUT /api/admin/news/:id/publish?value=true|false
 */
export const setAdminNewsPublished = (id, value) =>
  apiClient.put(`/api/admin/news/${id}/publish?value=${value}`);

/**
 * DELETE /api/admin/news/:id
 */
export const deleteAdminNews = (id) =>
  apiClient.delete(`/api/admin/news/${id}`);