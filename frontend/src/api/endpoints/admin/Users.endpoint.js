import { apiClient } from '../../client';

/**
 * GET /api/admin/users?search=
 */
export const getAdminUsers = (search = '') => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';

  return apiClient.get(`/api/admin/users${query}`);
};

/**
 * GET /api/admin/users/:id
 */
export const getAdminUserById = (id) =>
  apiClient.get(`/api/admin/users/${id}`);

/**
 * PUT /api/admin/users/:id/profile
 */
export const updateAdminUserProfile = (id, body) =>
  apiClient.put(`/api/admin/users/${id}/profile`, body);

/**
 * PUT /api/admin/users/:id/clan
 */
export const setAdminUserClan = (id, body) =>
  apiClient.put(`/api/admin/users/${id}/clan`, body);

/**
 * DELETE /api/admin/users/:id/clan
 */
export const removeAdminUserClan = (id) =>
  apiClient.delete(`/api/admin/users/${id}/clan`);

/**
 * PUT /api/admin/users/:id/clan-rank
 */
export const updateAdminUserClanRank = (id, body) =>
  apiClient.put(`/api/admin/users/${id}/clan-rank`, body);

/**
 * PUT /api/admin/users/:id/administrator?value=true|false
 */
export const setAdminUserAdministrator = (id, value) =>
  apiClient.put(`/api/admin/users/${id}/administrator?value=${value}`);

/**
 * GET /api/admin/users/ranks
 */
export const getAdminUserClanRanks = () =>
  apiClient.get('/api/admin/users/ranks');