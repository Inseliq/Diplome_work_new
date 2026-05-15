export { getEvents, getEventById } from './events.endpoint';
export { getNews, getNewsById } from './news.endpoint';
export { getMarks } from './marks.endpoint';

export {
  getCustomTournaments,
  getCustomTournamentById,
  registerToTournament
} from './tournaments.endpoint';

export {
  login,
  register,
  logout,
  refresh,
  getCurrentUser
} from './auth.endpoint';