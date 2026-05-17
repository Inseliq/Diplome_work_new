import { apiClient } from '../../client';

/**
 * GET /api/admin/clans
 */
export const getAdminClans = () =>
  apiClient.get('/api/admin/clans');

/**
 * GET /api/admin/clans/:id
 */
export const getAdminClanById = (id) =>
  apiClient.get(`/api/admin/clans/${id}`);

/**
 * POST /api/admin/clans
 */
export const createAdminClan = (body) =>
  apiClient.post('/api/admin/clans', body);

/**
 * PUT /api/admin/clans/:id
 */
export const updateAdminClan = (id, body) =>
  apiClient.put(`/api/admin/clans/${id}`, body);

/**
 * DELETE /api/admin/clans/:id
 */
export const deleteAdminClan = (id) =>
  apiClient.delete(`/api/admin/clans/${id}`);

/**
 * DELETE /api/admin/clans/:clanId/players/:userId
 */
export const removeAdminClanPlayer = (clanId, userId) =>
  apiClient.delete(`/api/admin/clans/${clanId}/players/${userId}`);

/**
 * PUT /api/admin/clans/:clanId/players/rank
 */
export const updateAdminClanPlayerRank = (clanId, body) =>
  apiClient.put(`/api/admin/clans/${clanId}/players/rank`, body);

/**
 * GET /api/admin/clans/ranks
 */
export const getAdminClanRanks = () =>
  apiClient.get('/api/admin/clans/ranks');