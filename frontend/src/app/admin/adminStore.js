// @ -1, 129 + 0, 0 @@
// /**
//  * adminStore.js
//  * Простое хранилище на localStorage для всех сущностей админ-панели.
//  * При первом запуске инициализируется из статичных данных.
//  */

// import { NEWS_DATA } from '../data/newsData';
// import { CUSTOMS_DATA } from '../data/customsData';
// import { DIRECTORY_DATA } from '../data/directoryData';

// const KEYS = {
//   news: 'admin_news',
//   tournaments: 'admin_tournaments',
//   services: 'admin_services',
//   catalog: 'admin_catalog',
// };

// const DEFAULT_SERVICES = [
//   { id: 1, path: '/achievements/marks', icon: '/images/services/marks.service.svg', title: 'Отметки на орудии', desc: 'Показатель степени мастерства игроков на танке.', visible: true },
//   { id: 2, path: '/achievements/masters', icon: '/images/services/masters.service.svg', title: 'Знак классности мастер', desc: 'Необходимое количество опыта для взятия мастера на танке.', visible: true },
//   { id: 3, path: '/tournaments', icon: '/images/services/tournaments.service.svg', title: 'Турниры', desc: 'Запись, сетки, трансляции и результаты кастомных турниров.', visible: true },
//   { id: 4, path: '', icon: '/images/services/achievements.service.svg', title: 'Достижения', desc: 'Ваши достижения в удобном и подробном формате.', visible: false },
//   { id: 5, path: '/clan', icon: '/images/services/clans.service.svg', title: 'Клан', desc: 'Клановые события, активация резервов, глобальная карта.', visible: true },
//   { id: 6, path: '', icon: '/images/services/recruts.service.svg', title: 'Рекрутинг', desc: 'Параметры для вступления в клан. Академка и основа.', visible: false },
// ];

// // ─── helpers ─────────────────────────────────────────────────────

// function load(key, fallback) {
//   try {
//     const raw = localStorage.getItem(key);
//     return raw ? JSON.parse(raw) : fallback;
//   } catch {
//     return fallback;
//   }
// }

// function save(key, data) {
//   localStorage.setItem(key, JSON.stringify(data));
// }

// function nextId(arr) {
//   return arr.length ? Math.max(...arr.map((i) => i.id ?? 0)) + 1 : 1;
// }

// // ─── NEWS ─────────────────────────────────────────────────────────

// export const newsStore = {
//   getAll: () => load(KEYS.news, NEWS_DATA),
//   getById: (id) => newsStore.getAll().find((n) => n.id === Number(id)) ?? null,
//   create: (item) => {
//     const list = newsStore.getAll();
//     const created = { ...item, id: nextId(list) };
//     save(KEYS.news, [created, ...list]);
//     return created;
//   },
//   update: (id, patch) => {
//     const list = newsStore.getAll().map((n) =>
//       n.id === Number(id) ? { ...n, ...patch } : n
//     );
//     save(KEYS.news, list);
//   },
//   remove: (id) => {
//     save(KEYS.news, newsStore.getAll().filter((n) => n.id !== Number(id)));
//   },
//   reset: () => save(KEYS.news, NEWS_DATA),
// };

// // ─── TOURNAMENTS ──────────────────────────────────────────────────

// export const tournamentsStore = {
//   getAll: () => load(KEYS.tournaments, CUSTOMS_DATA),
//   getById: (id) => tournamentsStore.getAll().find((t) => t.id === Number(id)) ?? null,
//   create: (item) => {
//     const list = tournamentsStore.getAll();
//     const created = { ...item, id: nextId(list) };
//     save(KEYS.tournaments, [created, ...list]);
//     return created;
//   },
//   update: (id, patch) => {
//     const list = tournamentsStore.getAll().map((t) =>
//       t.id === Number(id) ? { ...t, ...patch } : t
//     );
//     save(KEYS.tournaments, list);
//   },
//   remove: (id) => {
//     save(KEYS.tournaments, tournamentsStore.getAll().filter((t) => t.id !== Number(id)));
//   },
//   reset: () => save(KEYS.tournaments, CUSTOMS_DATA),
// };

// // ─── SERVICES ─────────────────────────────────────────────────────

// export const servicesStore = {
//   getAll: () => load(KEYS.services, DEFAULT_SERVICES),
//   update: (id, patch) => {
//     const list = servicesStore.getAll().map((s) =>
//       s.id === Number(id) ? { ...s, ...patch } : s
//     );
//     save(KEYS.services, list);
//   },
//   create: (item) => {
//     const list = servicesStore.getAll();
//     const created = { ...item, id: nextId(list) };
//     save(KEYS.services, [...list, created]);
//     return created;
//   },
//   remove: (id) => {
//     save(KEYS.services, servicesStore.getAll().filter((s) => s.id !== Number(id)));
//   },
//   reset: () => save(KEYS.services, DEFAULT_SERVICES),
// };

// // ─── CATALOG ──────────────────────────────────────────────────────

// export const catalogStore = {
//   getAll: () => load(KEYS.catalog, DIRECTORY_DATA),
//   getById: (id) => catalogStore.getAll().find((c) => c.id === Number(id)) ?? null,
//   update: (id, patch) => {
//     const list = catalogStore.getAll().map((c) =>
//       c.id === Number(id) ? { ...c, ...patch } : c
//     );
//     save(KEYS.catalog, list);
//   },
//   remove: (id) => {
//     save(KEYS.catalog, catalogStore.getAll().filter((c) => c.id !== Number(id)));
//   },
//   reset: () => save(KEYS.catalog, DIRECTORY_DATA),
// };
