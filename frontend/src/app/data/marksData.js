/**
 * Заглушка пока бэкенд-прокси не готов.
 * Структура полностью совпадает с реальными данными poliroid.
 */

// Маппинг ключей нации → отображаемое название
export const NATION_LABELS = {
  ussr: 'СССР',
  germany: 'Германия',
  usa: 'США',
  china: 'Китай',
  france: 'Франция',
  uk: 'Великобритания',
  japan: 'Япония',
  czech: 'Чехословакия',
  sweden: 'Швеция',
  poland: 'Польша',
  italy: 'Италия',
  intunion: 'Сборная нация',
};

// Маппинг типов
export const TYPE_LABELS = {
  heavyTank: 'Тяжёлый',
  mediumTank: 'Средний',
  lightTank: 'Лёгкий',
  'AT-SPG': 'ПТ',
  SPG: 'САУ',
};

export const TYPE_SVG = {
  heavyTank: '/images/types/heavy_tank.svg',
  mediumTank: '/images/types/medium_tank.svg',
  lightTank: '/images/types/light_tank.svg',
  'AT-SPG': '/images/types/at_spg.svg',
  SPG: '/images/types/spg.svg',
};

export const TIER_LABELS = ['V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

export const VEHICLE_KIND_LABELS = {
  premium: 'Премиум',
  default: 'Обычные',
  special: 'Специальные',
  collector: 'Коллекционные',
};

export const VEHICLE_KIND_KEYS = Object.keys(VEHICLE_KIND_LABELS);
export const NATION_KEYS = Object.keys(NATION_LABELS);
export const TYPE_KEYS = Object.keys(TYPE_LABELS);