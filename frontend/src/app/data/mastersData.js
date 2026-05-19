// Нации
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

// Типы
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

export const MASTERY_SVG = {
  deg3: '/images/mastery/third_degree.png',
  deg2: '/images/mastery/second_degree.png',
  deg1: '/images/mastery/first_degree.png',
  master: '/images/mastery/master.png',
};

export const NATION_KEYS = Object.keys(NATION_LABELS);
export const TYPE_KEYS = Object.keys(TYPE_LABELS);

export const TIERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export const TIER_ROMAN = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
  9: 'IX',
  10: 'X',
  11: 'XI',
};

export const VEHICLE_KIND_LABELS = {
  premium: 'Премиум',
  default: 'Обычные',
  special: 'Специальные',
  collector: 'Коллекционные',
};

export const VEHICLE_KIND_KEYS = Object.keys(VEHICLE_KIND_LABELS);