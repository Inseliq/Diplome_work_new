import { apiClient } from '../../client';

export const getAdminTournaments = (search = '') => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';

  return apiClient.get(`/api/admin/tournaments${query}`);
};

export const getAdminTournamentById = (id) =>
  apiClient.get(`/api/admin/tournaments/${id}`);

export const createAdminTournament = (body) =>
  apiClient.post('/api/admin/tournaments', body);

export const updateAdminTournament = (id, body) =>
  apiClient.put(`/api/admin/tournaments/${id}`, body);

export const setAdminTournamentPublished = (id, value) =>
  apiClient.put(`/api/admin/tournaments/${id}/publish?value=${value}`);

export const deleteAdminTournament = (id) =>
  apiClient.delete(`/api/admin/tournaments/${id}`);

export const deleteAdminTournamentRegistration = (tournamentId, registrationId) =>
  apiClient.delete(`/api/admin/tournaments/${tournamentId}/registrations/${registrationId}`);

export const createAdminTournamentMap = (tournamentId, body) =>
  apiClient.post(`/api/admin/tournaments/${tournamentId}/maps`, body);

export const updateAdminTournamentMap = (tournamentId, mapId, body) =>
  apiClient.put(`/api/admin/tournaments/${tournamentId}/maps/${mapId}`, body);

export const deleteAdminTournamentMap = (tournamentId, mapId) =>
  apiClient.delete(`/api/admin/tournaments/${tournamentId}/maps/${mapId}`);

export const createAdminTournamentPrize = (tournamentId, body) =>
  apiClient.post(`/api/admin/tournaments/${tournamentId}/prizes`, body);

export const updateAdminTournamentPrize = (tournamentId, prizeId, body) =>
  apiClient.put(`/api/admin/tournaments/${tournamentId}/prizes/${prizeId}`, body);

export const deleteAdminTournamentPrize = (tournamentId, prizeId) =>
  apiClient.delete(`/api/admin/tournaments/${tournamentId}/prizes/${prizeId}`);

export const confirmAdminTournamentRegistration = (tournamentId, registrationId, body = {}) =>
  apiClient.put(`/api/admin/tournaments/${tournamentId}/registrations/${registrationId}/confirm`, body);

export const rejectAdminTournamentRegistration = (tournamentId, registrationId, body = {}) =>
  apiClient.put(`/api/admin/tournaments/${tournamentId}/registrations/${registrationId}/reject`, body);