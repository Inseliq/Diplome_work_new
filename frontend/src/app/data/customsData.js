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

// Форматы для фильтра
export const FORMATS = ['1x1', '2x2', '3x3', '5x5', '7x7', '15x15'];

// Уровни для фильтра
export const TIERS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];