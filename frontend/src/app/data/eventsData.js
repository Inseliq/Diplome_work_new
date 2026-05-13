// status: 'active' | 'ended' | 'soon'

export const STATUS_CONFIG = {
  active: { label: 'Активно', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' },
  ended: { label: 'Завершено', color: '#888888', bg: 'rgba(136,136,136,0.1)', border: 'rgba(136,136,136,0.25)' },
  soon: { label: 'Скоро', color: '#FAB81B', bg: 'rgba(250,184,27,0.1)', border: 'rgba(250,184,27,0.3)' },
};

export const CATEGORY_COLORS = {
  'Клан': { color: '#835de4', bg: 'rgba(131,93,228,0.1)', border: 'rgba(131,93,228,0.25)' },
  'Турнир': { color: '#FF5000', bg: 'rgba(255,80,0,0.1)', border: 'rgba(255,80,0,0.25)' },
  'Событие': { color: '#FAB81B', bg: 'rgba(250,184,27,0.1)', border: 'rgba(250,184,27,0.25)' },
};

// Уникальные категории для второго фильтра
export const CATEGORIES = ['Все', 'Турнир', 'Событие', 'Клан'];