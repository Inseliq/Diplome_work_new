/**
 * Заглушка пока бэкенд-прокси не готов.
 * Структура полностью совпадает с реальными данными poliroid.
 */
export const MARKS_FALLBACK = [
  { tank_id: 1, name: 'Т-62А', nation: 'ussr', type: 'mediumTank', tier: 10, moe_65: 2650, moe_85: 3410, moe_95: 4050, moe_100: 4580 },
  { tank_id: 2, name: 'Объект 430У', nation: 'ussr', type: 'mediumTank', tier: 10, moe_65: 2870, moe_85: 3680, moe_95: 4310, moe_100: 4900 },
  { tank_id: 3, name: 'Объект 277', nation: 'ussr', type: 'heavyTank', tier: 10, moe_65: 2920, moe_85: 3750, moe_95: 4390, moe_100: 4980 },
  { tank_id: 4, name: 'ИС-7', nation: 'ussr', type: 'heavyTank', tier: 10, moe_65: 2540, moe_85: 3270, moe_95: 3860, moe_100: 4370 },
  { tank_id: 5, name: 'СУ-122-54', nation: 'ussr', type: 'AT-SPG', tier: 9, moe_65: 1980, moe_85: 2640, moe_95: 3150, moe_100: null },
  { tank_id: 6, name: 'E 100', nation: 'germany', type: 'heavyTank', tier: 10, moe_65: 2780, moe_85: 3580, moe_95: 4220, moe_100: 4790 },
  { tank_id: 7, name: 'Leopard 1', nation: 'germany', type: 'mediumTank', tier: 10, moe_65: 2430, moe_85: 3210, moe_95: 3870, moe_100: 4420 },
  { tank_id: 8, name: 'Grille 15', nation: 'germany', type: 'AT-SPG', tier: 10, moe_65: 2310, moe_85: 3050, moe_95: 3690, moe_100: 4180 },
  { tank_id: 9, name: 'М48А5 Паттон', nation: 'usa', type: 'mediumTank', tier: 10, moe_65: 2520, moe_85: 3280, moe_95: 3910, moe_100: 4440 },
  { tank_id: 10, name: 'T110E4', nation: 'usa', type: 'AT-SPG', tier: 10, moe_65: 2460, moe_85: 3190, moe_95: 3800, moe_100: 4310 },
  { tank_id: 11, name: 'AMX 50 B', nation: 'france', type: 'heavyTank', tier: 10, moe_65: 2690, moe_85: 3470, moe_95: 4100, moe_100: 4660 },
  { tank_id: 12, name: 'Bat.-Châtillon 25 t', nation: 'france', type: 'mediumTank', tier: 10, moe_65: 2580, moe_85: 3350, moe_95: 4010, moe_100: 4560 },
  { tank_id: 13, name: 'FV215b 183', nation: 'uk', type: 'AT-SPG', tier: 10, moe_65: 2140, moe_85: 2860, moe_95: 3440, moe_100: 3920 },
  { tank_id: 14, name: 'Manticore', nation: 'uk', type: 'lightTank', tier: 10, moe_65: 2190, moe_85: 3060, moe_95: 3820, moe_100: 4380 },
  { tank_id: 15, name: '113', nation: 'china', type: 'heavyTank', tier: 10, moe_65: 2630, moe_85: 3390, moe_95: 4020, moe_100: 4570 },
  { tank_id: 16, name: 'Type 5 Heavy', nation: 'japan', type: 'heavyTank', tier: 10, moe_65: 2750, moe_85: 3530, moe_95: 4160, moe_100: 4720 },
  { tank_id: 17, name: 'TVP T 50/51', nation: 'czech', type: 'mediumTank', tier: 10, moe_65: 2480, moe_85: 3220, moe_95: 3870, moe_100: 4400 },
  { tank_id: 18, name: 'Kranvagn', nation: 'sweden', type: 'heavyTank', tier: 10, moe_65: 2560, moe_85: 3310, moe_95: 3940, moe_100: 4470 },
  { tank_id: 19, name: '60TP Lewandowskiego', nation: 'poland', type: 'heavyTank', tier: 10, moe_65: 2840, moe_85: 3650, moe_95: 4280, moe_100: 4850 },
  { tank_id: 20, name: 'Progetto M40 mod. 65', nation: 'italy', type: 'mediumTank', tier: 10, moe_65: 2510, moe_85: 3260, moe_95: 3900, moe_100: 4430 },
];

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

export const NATION_KEYS = Object.keys(NATION_LABELS);
export const TYPE_KEYS = Object.keys(TYPE_LABELS);