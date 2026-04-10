/**
 * Заглушка — загружается когда Poliroid недоступен.
 * mastery[0]=3-я степень, [1]=2-я, [2]=1-я, [3]=мастер
 */
export const MASTERS_FALLBACK = [
  { tank_id: 1, name: 'Т-34', nation: 'ussr', type: 'mediumTank', tier: 5, is_premium: false, is_special: false, is_collector: false, deg3: 329, deg2: 550, deg1: 822, master: 1275 },
  { tank_id: 3, name: 'Объект 277', nation: 'ussr', type: 'heavyTank', tier: 10, is_premium: false, is_special: false, is_collector: false, deg3: 780, deg2: 1049, deg1: 1289, master: 1473 },
  { tank_id: 4, name: 'ИС-7', nation: 'ussr', type: 'heavyTank', tier: 10, is_premium: false, is_special: false, is_collector: false, deg3: 625, deg2: 839, deg1: 1044, master: 1225 },
  { tank_id: 6, name: 'E 100', nation: 'germany', type: 'heavyTank', tier: 10, is_premium: false, is_special: false, is_collector: false, deg3: 564, deg2: 728, deg1: 885, master: 1065 },
  { tank_id: 7, name: 'Leopard 1', nation: 'germany', type: 'mediumTank', tier: 10, is_premium: false, is_special: false, is_collector: false, deg3: 579, deg2: 828, deg1: 1058, master: 1271 },
  { tank_id: 9, name: 'М48А5 Паттон', nation: 'usa', type: 'mediumTank', tier: 10, is_premium: false, is_special: false, is_collector: false, deg3: 597, deg2: 915, deg1: 1213, master: 1437 },
  { tank_id: 11, name: 'AMX 50 B', nation: 'france', type: 'heavyTank', tier: 10, is_premium: false, is_special: false, is_collector: false, deg3: 661, deg2: 897, deg1: 1116, master: 1303 },
  { tank_id: 13, name: 'FV215b 183', nation: 'uk', type: 'AT-SPG', tier: 10, is_premium: false, is_special: false, is_collector: false, deg3: 532, deg2: 856, deg1: 1149, master: 1386 },
  { tank_id: 14, name: 'Manticore', nation: 'uk', type: 'lightTank', tier: 10, is_premium: false, is_special: false, is_collector: false, deg3: 482, deg2: 760, deg1: 1038, master: 1271 },
  { tank_id: 15, name: '113', nation: 'china', type: 'heavyTank', tier: 10, is_premium: false, is_special: false, is_collector: false, deg3: 606, deg2: 855, deg1: 1090, master: 1298 },
  { tank_id: 16, name: 'Type 5 Heavy', nation: 'japan', type: 'heavyTank', tier: 10, is_premium: false, is_special: false, is_collector: false, deg3: 520, deg2: 807, deg1: 1070, master: 1280 },
  { tank_id: 17, name: 'TVP T 50/51', nation: 'czech', type: 'mediumTank', tier: 10, is_premium: false, is_special: false, is_collector: false, deg3: 620, deg2: 853, deg1: 1043, master: 1204 },
  { tank_id: 18, name: 'Kranvagn', nation: 'sweden', type: 'heavyTank', tier: 10, is_premium: false, is_special: false, is_collector: false, deg3: 539, deg2: 785, deg1: 1025, master: 1195 },
  { tank_id: 19, name: '60TP Lewandowskiego', nation: 'poland', type: 'heavyTank', tier: 10, is_premium: false, is_special: false, is_collector: false, deg3: 876, deg2: 1154, deg1: 1377, master: 1560 },
  { tank_id: 20, name: 'Progetto M40', nation: 'italy', type: 'mediumTank', tier: 10, is_premium: false, is_special: false, is_collector: false, deg3: 488, deg2: 808, deg1: 1021, master: 1149 },
];

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

// SVG заготовки типов
export const TYPE_SVG = {
  heavyTank: '/images/types/heavy_tank.svg',
  mediumTank: '/images/types/medium_tank.svg',
  lightTank: '/images/types/light_tank.svg',
  'AT-SPG': '/images/types/at_spg.svg',
  SPG: '/images/types/spg.svg',
};

// SVG заготовки степеней мастерства (thead иконки)
export const MASTERY_SVG = {
  deg3: '/images/mastery/third_degree.svg',
  deg2: '/images/mastery/second_degree.svg',
  deg1: '/images/mastery/first_degree.svg',
  master: '/images/mastery/master.svg',
};

export const NATION_KEYS = Object.keys(NATION_LABELS);
export const TYPE_KEYS = Object.keys(TYPE_LABELS);

// Уровни 2–11
export const TIERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
export const TIER_ROMAN = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
  5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX',
  10: 'X', 11: 'XI',
};