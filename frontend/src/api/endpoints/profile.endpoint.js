import { apiClient } from '../client';

/**
 * GET /api/profile
 */
export const getProfile = () => apiClient.get('/api/profile');

/**
 * PUT /api/profile/nickname
 */
export const updateProfileNickname = (body) =>
  apiClient.put('/api/profile/nickname', body);

/**
 * PUT /api/profile/email
 */
export const updateProfileEmail = (body) =>
  apiClient.put('/api/profile/email', body);

/**
 * POST /api/profile/change-password
 */
export const changeProfilePassword = (body) =>
  apiClient.post('/api/profile/change-password', body);

/**
 * POST /api/profile/leave-clan
 */
export const leaveClan = () => apiClient.post('/api/profile/leave-clan');

/**
 * GET /api/profile/my-clan
 */
export const getMyClan = () => apiClient.get('/api/profile/my-clan');