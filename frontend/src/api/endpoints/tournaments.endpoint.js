import { apiClient } from '../client';

/**
 * GET /api/tournaments/custom
 */
export const getCustomTournaments = () => apiClient.get('/api/tournaments/custom');

/**
 * GET /api/tournaments/custom/:id
 */
export const getCustomTournamentById = (id) =>
  apiClient.get(`/api/tournaments/custom/${id}`);

/**
 * POST /api/tournaments/custom/:id/register
 */
export const registerToTournament = (id, payload) =>
  apiClient.post(`/api/tournaments/custom/${id}/register`, payload);