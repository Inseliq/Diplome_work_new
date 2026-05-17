import { apiClient } from '../../client';

/**
 * GET /api/admin/home-banners
 */
export const getAdminHomeBanners = () =>
  apiClient.get('/api/admin/home-banners');

/**
 * GET /api/admin/home-banners/:id
 */
export const getAdminHomeBannerById = (id) =>
  apiClient.get(`/api/admin/home-banners/${id}`);

/**
 * POST /api/admin/home-banners
 */
export const createAdminHomeBanner = (body) =>
  apiClient.post('/api/admin/home-banners', body);

/**
 * PUT /api/admin/home-banners/:id
 */
export const updateAdminHomeBanner = (id, body) =>
  apiClient.put(`/api/admin/home-banners/${id}`, body);

/**
 * PUT /api/admin/home-banners/:id/publish?value=true|false
 */
export const setAdminHomeBannerPublished = (id, value) =>
  apiClient.put(`/api/admin/home-banners/${id}/publish?value=${value}`);

/**
 * DELETE /api/admin/home-banners/:id
 */
export const deleteAdminHomeBanner = (id) =>
  apiClient.delete(`/api/admin/home-banners/${id}`);

/**
 * DELETE /api/admin/home-banners/slot/:slot
 */
export const deleteAdminHomeBannerBySlot = (slot) =>
  apiClient.delete(`/api/admin/home-banners/slot/${slot}`);