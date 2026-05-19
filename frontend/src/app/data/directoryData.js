export const POLEVAYA_ITEMS = {
  // Секция II — Ходовая
  item__1: { label: 'Вездеходная ходовая', img: '/images/polevaya/item__1.png' },
  item__2: { label: 'Облегчённая ходовая', img: '/images/polevaya/item__2.png' },
  // Секция IV — Прицел/Наведение
  item__3: { label: 'Отстройка параллакса', img: '/images/polevaya/item__3.png' },
  item__4: { label: 'Притирка шестерней наведения', img: '/images/polevaya/item__4.png' },
  // Секция V — Экипаж
  item__5: { label: 'Звукоизоляция', img: '/images/polevaya/item__5.png' },
  item__6: { label: 'Электропривод перископа', img: '/images/polevaya/item__6.png' },
  // Секция VII — Двигатель
  item__7: { label: 'Настройка отбора мощности (Схема 1)', img: '/images/polevaya/item__7.png' },
  item__8: { label: 'Настройка отбора мощности (Схема 2)', img: '/images/polevaya/item__8.png' },
  // Секция VIII — Корпус
  item__9: { label: 'Усиленный корпус', img: '/images/polevaya/item__9.png' },
  item__10: { label: 'Облегчённый корпус', img: '/images/polevaya/item__10.png' },
  // Орудие
  item__11: { label: 'Скорострельность', img: '/images/polevaya/item__11.png' },
  item__12: { label: 'Точность', img: '/images/polevaya/item__12.png' },
  item__13: { label: 'Бронепробиваемость', img: '/images/polevaya/item__13.png' },
  item__14: { label: 'Манёвренность', img: '/images/polevaya/item__14.png' },
  item__15: { label: 'Разброс после выстрела', img: '/images/polevaya/item__15.png' },
};

export const SECTION_LABELS = {
  section1: 'II',
  section2: 'IV',
  section3: 'V',
  section4: 'VII',
  section5: 'VIII',
};

export const getPolevayaSectionCount = (tier) => {
  if (tier <= 5) return 0;
  if (tier <= 8) return 3;
  if (tier === 9) return 4;
  return 5; // 10-11
};

// ─── ОБОРУДОВАНИЕ ────────────────────────────────────────────────

export const EQUIPMENT = {
  rammer: { label: 'Досылатель', tier: 'std', img: '/images/equipment/rammer.png' },
  rammer__bonns: { label: 'Досылатель', tier: 'bonns', img: '/images/equipment/rammer_bonns.png' },
  rammer__t3: { label: 'Многозубая каретка досылателя', tier: 't3', img: '/images/equipment/rammer_t3.png' },

  stabilizer: { label: 'Стабилизатор', tier: 'std', img: '/images/equipment/stabilizer.png' },
  stabilizer__bonns: { label: 'Боновый стабилизатор', tier: 'bonns', img: '/images/equipment/stabilizer_bonns.png' },
  stabilizer__t3: { label: 'Стабилизатор', tier: 't3', img: '/images/equipment/stabilizer_t3.png' },

  optics: { label: 'Просмотр', tier: 'std', img: '/images/equipment/optics.png' },
  optics__bonns: { label: 'Просмотр', tier: 'bonns', img: '/images/equipment/optics_bonns.png' },
  optics__t3: { label: 'Просмотр', tier: 't3', img: '/images/equipment/optics_t3.png' },

  vents: { label: 'Вентиляция', tier: 'std', img: '/images/equipment/vents.png' },
  vents__bonns: { label: 'Вентиляция', tier: 'bonns', img: '/images/equipment/vents_bonns.png' },
  vents__t3: { label: 'Вентиляция', tier: 't3', img: '/images/equipment/vents_t3.png' },

  aim_drive: { label: 'Привод наводки', tier: 'std', img: '/images/equipment/aim_drive.png' },
  aim_drive__bonns: { label: 'Привод наводки', tier: 'bonns', img: '/images/equipment/aim_drive_bonns.png' },
  aim_drive__t3: { label: 'Привод наводки', tier: 't3', img: '/images/equipment/aim_drive_t3.png' },

  enhoptics: { label: 'Улучш. оптика', tier: 'std', img: '/images/equipment/enhoptics.png' },
  enhoptics__bonns: { label: 'Улучш. оптика', tier: 'bonns', img: '/images/equipment/enhoptics_bonns.png' },
  enhoptics__t3: { label: 'Улучш. оптика', tier: 't3', img: '/images/equipment/enhoptics_t3.png' },

  turbine: { label: 'Турбина', tier: 'std', img: '/images/equipment/turbine.png' },
  turbine__bonns: { label: 'Боновая турбина', tier: 'bonns', img: '/images/equipment/turbine_bonns.png' },
  turbine__t3: { label: 'Система повышения мобильности', tier: 't3', img: '/images/equipment/turbine_t3.png' },

  hardening: { label: 'Закалка', tier: 'std', img: '/images/equipment/hardening.png' },
  hardening__bonns: { label: 'Боновая закалка', tier: 'bonns', img: '/images/equipment/hardening_bonns.png' },
  hardening__t3: { label: 'Комплекс улучшения выживаемости', tier: 't3', img: '/images/equipment/hardening_t3.png' },

  reinforced_aim: { label: 'Усил. приводы', tier: 'std', img: '/images/equipment/reinforced_aim.png' },
  reinforced_aim__bonns: { label: 'Усил. приводы', tier: 'bonns', img: '/images/equipment/reinforced_aim_bonns.png' },
  reinforced_aim__t3: { label: 'Усил. приводы', tier: 't3', img: '/images/equipment/reinforced_aim_t3.png' },

  camo_net: { label: 'Маскировочная сеть', tier: 'std', img: '/images/equipment/camo_net.png' },
  camo_net__bonns: { label: 'Маскировочная сеть', tier: 'bonns', img: '/images/equipment/camo_net_bonns.png' },
  camo_net__t3: { label: 'Маскировочная сеть', tier: 't3', img: '/images/equipment/camo_net_t3.png' },
};

export const EQUIPMENT_TIER_COLORS = {
  std: { color: '#CCCCCC', bg: 'rgba(200,200,200,0.08)', border: 'rgba(200,200,200,0.2)', label: 'Стандарт' },
  bonns: { color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.45)', label: 'Технологии 3 ур.' },
  t3: { color: '#FAB81B', bg: 'rgba(250,184,27,0.12)', border: 'rgba(250,184,27,0.35)', label: 'Улучшенное' },
};

export const getEquipmentTier = (key) => {
  if (key.includes('__t3')) return 't3';
  if (key.includes('__bonns')) return 'bonns';
  return 'std';
};

// ─── РОЛИ ────────────────────────────────────────────────────────

export const ROLE_LABELS = {
  role_HT_assault: 'Тяжёлый танк штурмовой',
  role_HT_break: 'Тяжёлый танк прорыва',
  role_HT_support: 'Тяжёлый танк поддержки',
  role_HT_universal: 'Тяжёлый танк универсальный',
  role_MT_assault: 'Средний танк штурмовой',
  role_MT_sniper: 'Средний танк снайперский',
  role_MT_support: 'Средний танк поддержки',
  role_MT_universal: 'Средний танк универсальный',
  role_LT_universal: 'Лёгкий танк универсальный',
  role_LT_wheeled: 'Лёгкий танк колёсный',
  role_ATSPG_assault: 'ПТ-САУ штурмовая',
  role_ATSPG_sniper: 'ПТ-САУ снайперская',
  role_ATSPG_support: 'ПТ-САУ поддержки',
  role_ATSPG_universal: 'ПТ-САУ универсальная',
  role_SPG: 'САУ поддержки',
  role_SPG_assault: 'САУ штурмовая',
  role_SPG_flame: 'САУ огнемётная',
};

// ─── ИКОНКИ ТИПОВ (5 значков под оборудованием) ─────────────────

export const TYPE_ROLE_ICONS = {
  heavyTank: '/images/types/heavy_tank.svg',
  mediumTank: '/images/types/medium_tank.svg',
  lightTank: '/images/types/light_tank.svg',
  'AT-SPG': '/images/types/at_spg.svg',
  SPG: '/images/types/spg.svg',
};

// ─── РЕЖИМЫ / СБОРКИ ─────────────────────────────────────────────

export const BUILD_LABELS = {
  random: { label: 'Случайный бой', color: '#582BBA' },
  fortified: { label: 'Укреп. район', color: '#FF5000' },
};

export const STATE_LABELS = {
  state1: { label: 'Статистика (Т3)', color: '#FAB81B', icon: '▲' },
  state2: { label: 'Статистика (Бонус)', color: '#a855f7', icon: '▲' },
  default: { label: 'Обычная сборка', color: '#888888', icon: '◆' },
};