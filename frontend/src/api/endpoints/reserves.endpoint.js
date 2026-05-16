import { apiClient } from '../client';

/**
 * GET /api/clan/reserves
 * Возвращает состояние резервов текущего клана.
 */
export const getClanReserves = () => apiClient.get('/api/clan/reserves');

/**
 * POST /api/clan/reserves/activate/:reserveType
 * Активирует резерв текущего клана.
 */
export const activateClanReserve = (reserveType) =>
  apiClient.post(`/api/clan/reserves/activate/${reserveType}`);