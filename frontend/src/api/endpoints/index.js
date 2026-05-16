export { getEvents, getEventById } from './events.endpoint';
export { getNews, getNewsById } from './news.endpoint';
export { getMarks } from './marks.endpoint';
export { getMasters } from './masters.endpoint';
export { getLatestNotification } from './notification.endpoint';
export { getHomeBanners } from './homeBanners.endpoint';

export {
  getCustomTournaments,
  getCustomTournamentById,
  registerToTournament
} from './tournaments.endpoint';

export {
  getClanReserves,
  activateClanReserve
} from './reserves.endpoint';

export {
  login,
  register,
  logout,
  refresh,
  getCurrentUser
} from './auth.endpoint';

export {
  getProfile,
  changeProfilePassword,
  leaveClan,
  getMyClan
} from './profile.endpoint';

export {
  getDirectoryVehicles,
  getDirectoryVehicleById,
  getDirectoryDictionaries
} from './directory.endpoint';