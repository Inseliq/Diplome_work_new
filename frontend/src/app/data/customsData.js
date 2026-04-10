/**
 * Типы турниров и их цвета
 */
export const TOURNAMENT_TYPES = {
  common: { label: 'Обычный', color: 'rgba(200,200,210,0.9)', glow: 'rgba(200,200,210,0.2)', border: 'rgba(200,200,210,0.35)' },
  rare: { label: 'Редкий', color: '#4ade80', glow: 'rgba(74,222,128,0.2)', border: 'rgba(74,222,128,0.4)' },
  epic: { label: 'Эпический', color: '#a855f7', glow: 'rgba(168,85,247,0.25)', border: 'rgba(168,85,247,0.5)' },
  legendary: { label: 'Легендарный', color: '#FFD700', glow: 'rgba(255,215,0,0.25)', border: 'rgba(255,215,0,0.45)' },
  brilliant: { label: 'Бриллиантовый', color: '#b9f2ff', glow: 'rgba(185,242,255,0.3)', border: 'rgba(185,242,255,0.55)' },
};

/**
 * Статусы турнира
 * upcoming     — скоро, регистрация ещё не открылась
 * registration — регистрация открыта
 * active       — идёт прямо сейчас
 * finished     — завершён
 */
export const TOURNAMENT_STATUS = {
  upcoming: { label: 'Скоро', color: '#FAB81B', bg: 'rgba(250,184,27,0.1)', border: 'rgba(250,184,27,0.3)' },
  registration: { label: 'Регистрация', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' },
  active: { label: 'Идёт', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
  finished: { label: 'Завершён', color: '#888888', bg: 'rgba(136,136,136,0.1)', border: 'rgba(136,136,136,0.25)' },
};

/**
 * Типы призов
 */
export const PRIZE_TYPES = {
  rub: { label: '₽', color: '#22c55e' },
  gold: { label: 'золото', color: '#FFD700' },
  'time-prime': { label: 'Прайм', color: '#38bdf8' },
  any: { label: 'любой', color: '#a855f7' },
};

/**
 * Тир-луки
 */
export const TIER_ROMAN = {
  2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI',
};

/**
 * Классы турнира
 */
export const TOURNAMENT_CLASSES = ['BO3', 'PE', 'RE', 'ST'];

// ─── Полные данные турниров ────────────────────────────────────────────────────

export const CUSTOMS_DATA = [
  {
    id: 1,
    name: 'Железный кулак — Весенний сезон',
    description: 'Еженедельный клановый турнир в формате 7x7. Только для участников клана IEVGI и приглашённых команд.',
    type: 'epic',
    tier: 10,
    format: '7x7',
    teamSize: 7,
    reserveSize: 1,
    maxParticipants: 16,
    currentParticipants: 12,
    classes: ['BO3'],
    status: 'active',
    isStream: true,
    streamUrl: 'https://twitch.tv/evg_stream',
    dateStart: '17 марта 2025',
    dateEnd: '19 марта 2025',
    dateStartISO: '2025-03-17',
    dateEndISO: '2025-03-19',
    regStart: '10 марта 2025',
    regEnd: '16 марта 2025',
    regStartISO: '2025-03-10',
    regEndISO: '2025-03-16',
    openForAll: false,
    sponsor: 'EVG',
    eventId: 2,
    maps: [
      { name: 'Ласвилль', image: '/images/maps/lasvile.webp' },
      { name: 'Степи', image: '/images/maps/steppes.webp' },
      { name: 'Прохоровка', image: '/images/maps/prokhorovka.webp' },
    ],
    prizes: {
      place1: { amount: 5000, type: 'gold' },
      place2: { amount: 3000, type: 'gold' },
      place3: { amount: 1500, type: 'gold' },
      others: { amount: 500, type: 'gold' },
    },
    prizeText: null,
  },
  {
    id: 2,
    name: 'Кубок Весны 2025',
    description: 'Открытый турнир для всех желающих. Формат 15x15, только X уровень. Спонсор — Lesta Games.',
    type: 'legendary',
    tier: 10,
    format: '15x15',
    teamSize: 15,
    reserveSize: 2,
    maxParticipants: 32,
    currentParticipants: 18,
    classes: ['BO3', 'PE'],
    status: 'registration',
    isStream: true,
    streamUrl: 'https://youtube.com/@cosmomanager',
    dateStart: '1 апреля 2025',
    dateEnd: '5 апреля 2025',
    dateStartISO: '2025-04-01',
    dateEndISO: '2025-04-05',
    regStart: '20 марта 2025',
    regEnd: '30 марта 2025',
    regStartISO: '2025-03-20',
    regEndISO: '2025-03-30',
    openForAll: true,
    sponsor: 'Lesta Games',
    eventId: 4,
    maps: [
      { name: 'Прохоровка', image: '/images/maps/prokhorovka.webp' },
      { name: 'Химмельсдорф', image: '/images/maps/himmelsdorf.webp' },
    ],
    prizes: {
      place1: { amount: 200000, type: 'rub' },
      place2: { amount: 100000, type: 'rub' },
      place3: { amount: 50000, type: 'rub' },
      others: { amount: 10000, type: 'rub' },
    },
    prizeText: null,
  },
  {
    id: 3,
    name: 'Тренировочный 3x3',
    description: 'Небольшой тренировочный турнир для клана EVG. Формат 3x3, любой уровень VI–VIII.',
    type: 'common',
    tier: 8,
    format: '3x3',
    teamSize: 3,
    reserveSize: 1,
    maxParticipants: null,
    currentParticipants: 6,
    classes: ['ST'],
    status: 'upcoming',
    isStream: false,
    streamUrl: null,
    dateStart: '25 апреля 2025',
    dateEnd: '25 апреля 2025',
    dateStartISO: '2025-04-25',
    dateEndISO: '2025-04-25',
    regStart: '18 апреля 2025',
    regEnd: '24 апреля 2025',
    regStartISO: '2025-04-18',
    regEndISO: '2025-04-24',
    openForAll: false,
    sponsor: null,
    eventId: null,
    maps: [
      { name: 'Степи', image: '/images/maps/steppes.webp' },
    ],
    prizes: {
      place1: { amount: 1000, type: 'gold' },
      place2: { amount: 500, type: 'gold' },
      place3: null,
      others: null,
    },
    prizeText: null,
  },
  {
    id: 4,
    name: 'Открытый чемпионат EVG — Сезон 1',
    description: 'Первый открытый чемпионат платформы CosmoManager. Участвовать может любой игрок. Приз — подписка Прайм на 30 дней.',
    type: 'rare',
    tier: 9,
    format: '5x5',
    teamSize: 5,
    reserveSize: 0,
    maxParticipants: 64,
    currentParticipants: 64,
    classes: ['BO3', 'RE'],
    status: 'finished',
    isStream: false,
    streamUrl: null,
    dateStart: '1 февраля 2025',
    dateEnd: '10 февраля 2025',
    dateStartISO: '2025-02-01',
    dateEndISO: '2025-02-10',
    regStart: '20 января 2025',
    regEnd: '31 января 2025',
    regStartISO: '2025-01-20',
    regEndISO: '2025-01-31',
    openForAll: true,
    sponsor: 'WILD_Seeatall',
    eventId: null,
    maps: [
      { name: 'Ласвилль', image: '/images/maps/lasvile.webp' },
      { name: 'Прохоровка', image: '/images/maps/prokhorovka.webp' },
      { name: 'Химмельсдорф', image: '/images/maps/himmelsdorf.webp' },
      { name: 'Малиновка', image: '/images/maps/malinovka.webp' },
    ],
    prizes: {
      place1: { amount: 30, type: 'time-prime' },
      place2: { amount: 14, type: 'time-prime' },
      place3: { amount: 7, type: 'time-prime' },
      others: { amount: 0, type: 'any', text: 'Памятный стиль' },
    },
    prizeText: null,
  },
  {
    id: 5,
    name: 'Бриллиантовый Кубок CosmoManager',
    description: 'Элитный турнир для сильнейших кланов. Только для участников IEVGI. Формат 15x15 + 3 запасных. Легендарный приз.',
    type: 'brilliant',
    tier: 10,
    format: '15x15',
    teamSize: 15,
    reserveSize: 3,
    maxParticipants: 8,
    currentParticipants: 0,
    classes: ['BO3', 'PE', 'RE'],
    status: 'registration',
    isStream: true,
    streamUrl: null,
    dateStart: '10 мая 2025',
    dateEnd: '15 мая 2025',
    dateStartISO: '2025-05-10',
    dateEndISO: '2025-05-15',
    regStart: '1 апреля 2025',
    regEnd: '1 мая 2025',
    regStartISO: '2025-04-01',
    regEndISO: '2025-05-01',
    openForAll: true,
    sponsor: 'CosmoManager',
    eventId: null,
    maps: [
      { name: 'Ласвилль', image: '/images/maps/lasvile.webp' },
      { name: 'Прохоровка', image: '/images/maps/prokhorovka.webp' },
    ],
    prizes: {
      place1: { amount: 0, type: 'any', text: 'Уникальный стиль + золото' },
      place2: { amount: 0, type: 'any', text: 'Золото + декаль' },
      place3: { amount: 0, type: 'any', text: 'Золото' },
      others: null,
    },
    prizeText: 'Призовой фонд будет объявлен позже',
  },
];

// Форматы для фильтра
export const FORMATS = ['1x1', '2x2', '3x3', '5x5', '7x7', '15x15'];

// Уровни для фильтра
export const TIERS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];