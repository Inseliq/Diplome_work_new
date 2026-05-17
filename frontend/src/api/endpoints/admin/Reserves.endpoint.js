import { apiClient } from '../../client';

/**
 * GET /api/admin/reserves?search=
 */
export const getAdminReserves = (search = '') => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';

  return apiClient.get(`/api/admin/reserves${query}`);
};

/**
 * GET /api/admin/reserves/:clanId
 */
export const getAdminClanReserves = (clanId) =>
  apiClient.get(`/api/admin/reserves/${clanId}`);

/**
 * PUT /api/admin/reserves/:clanId/:reserveType/set
 */
export const setAdminReserveAmount = (clanId, reserveType, amount) =>
  apiClient.put(`/api/admin/reserves/${clanId}/${reserveType}/set`, {
    amount,
  });

/**
 * POST /api/admin/reserves/:clanId/:reserveType/adjust
 */
export const adjustAdminReserveAmount = (clanId, reserveType, delta) =>
  apiClient.post(`/api/admin/reserves/${clanId}/${reserveType}/adjust`, {
    delta,
  });

/**
 * DELETE /api/admin/reserves/:clanId/:reserveType
 */
export const deleteAdminReserveInventory = (clanId, reserveType) =>
  apiClient.delete(`/api/admin/reserves/${clanId}/${reserveType}`);