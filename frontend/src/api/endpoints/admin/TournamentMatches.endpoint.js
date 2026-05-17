import { apiClient } from '../../client';

export const getAdminMatchTournaments = (search = '') => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';

  return apiClient.get(`/api/admin/tournament-matches/tournaments${query}`);
};

export const getAdminMatchRegistrations = (tournamentId) =>
  apiClient.get(`/api/admin/tournament-matches/tournaments/${tournamentId}/registrations`);

export const getAdminTournamentMatches = (tournamentId) =>
  apiClient.get(`/api/admin/tournament-matches/tournaments/${tournamentId}/matches`);

export const getAdminTournamentMatchById = (tournamentId, matchId) =>
  apiClient.get(`/api/admin/tournament-matches/tournaments/${tournamentId}/matches/${matchId}`);

export const createAdminTournamentMatch = (tournamentId, body) =>
  apiClient.post(`/api/admin/tournament-matches/tournaments/${tournamentId}/matches`, body);

export const updateAdminTournamentMatch = (tournamentId, matchId, body) =>
  apiClient.put(`/api/admin/tournament-matches/tournaments/${tournamentId}/matches/${matchId}`, body);

export const updateAdminTournamentMatchResult = (tournamentId, matchId, body) =>
  apiClient.put(`/api/admin/tournament-matches/tournaments/${tournamentId}/matches/${matchId}/result`, body);

export const deleteAdminTournamentMatch = (tournamentId, matchId) =>
  apiClient.delete(`/api/admin/tournament-matches/tournaments/${tournamentId}/matches/${matchId}`);