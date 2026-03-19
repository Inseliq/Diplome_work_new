import React from 'react';
import { Link } from 'react-router-dom';

const SERVICES = [
  {
    to: '/achievements/marks',
    icon: '🎯',
    title: 'Отметки на стволах',
    desc: 'Отслеживай прогресс отметок на орудиях своих танков в реальном времени.',
    color: 'var(--second-accent)',
    glow: 'rgba(255,80,0,0.15)',
  },
  {
    to: '/achievements/masters',
    icon: '🏅',
    title: 'Знак классности',
    desc: 'Статистика мастерства и прогресс до звания «Мастер» по каждой машине.',
    color: 'var(--third-accent)',
    glow: 'rgba(250,184,27,0.15)',
  },
  {
    to: '/tournaments',
    icon: '🏆',
    title: 'Турниры',
    desc: 'Клановые и личные турниры — расписание, результаты, регистрация.',
    color: 'var(--main-accent-effect)',
    glow: 'rgba(131,93,228,0.15)',
  },
  {
    to: '/achievements',
    icon: '🎖️',
    title: 'Достижения',
    desc: 'Полная коллекция достижений игры с прогрессом и редкостью.',
    color: 'var(--third-accent)',
    glow: 'rgba(250,184,27,0.15)',
  },
  {
    to: '/clan',
    icon: '⚔️',
    title: 'Клан',
    desc: 'Управление кланом, глобальная карта, резервы и достижения клана.',
    color: 'var(--main-accent-effect)',
    glow: 'rgba(131,93,228,0.15)',
  },
  {
    to: '/mods',
    icon: '🔧',
    title: 'Моды',
    desc: 'Каталог модификаций с описанием, скриншотами и прямыми ссылками.',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.15)',
  },
  {
    to: '/directory',
    icon: '📚',
    title: 'Каталог танков',
    desc: 'Характеристики, сравнение и гайды по всем машинам игры.',
    color: 'var(--second-accent)',
    glow: 'rgba(255,80,0,0.15)',
  },
  {
    to: '/onslaught',
    icon: '💥',
    title: 'Натиск',
    desc: 'Статистика и рейтинги режима «Натиск» — ранг, очки, топ игроков.',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.15)',
  },
  {
    to: '/documents',
    icon: '📄',
    title: 'Документация',
    desc: 'Руководства, гайды и официальная документация по сервисам платформы.',
    color: '#38bdf8',
    glow: 'rgba(56,189,248,0.15)',
  },
  {
    to: '/news',
    icon: '📰',
    title: 'Новости',
    desc: 'Последние обновления, патчноуты и новости игровой вселенной.',
    color: 'var(--main-accent-effect)',
    glow: 'rgba(131,93,228,0.15)',
  },
  {
    to: '/events',
    icon: '🗓️',
    title: 'События',
    desc: 'Игровые события, специальные режимы и ограниченные предложения.',
    color: 'var(--third-accent)',
    glow: 'rgba(250,184,27,0.15)',
  },
  {
    to: '/social-media',
    icon: '🌐',
    title: 'Социальные сети',
    desc: 'YouTube, Telegram, VK и официальная страница клана EVG.',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.15)',
  },
];

function Services() {
  return (
    <div className="wrapper services">
      <div className="container">

        <div className="services__header reveal">
          <div className="services__header-label">Платформа</div>
          <h1 className="services__title">Все сервисы</h1>
          <p className="services__subtitle">
            Инструменты для танкистов и кланов — всё в одном месте
          </p>
        </div>

        <div className="services__grid reveal">
          {SERVICES.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="service-card"
              style={{ '--card-color': s.color, '--card-glow': s.glow }}
            >
              <div className="service-card__glow-bg" />

              <div className="service-card__icon-wrap">
                <span className="service-card__icon">{s.icon}</span>
              </div>

              <div className="service-card__body">
                <h3 className="service-card__title">{s.title}</h3>
                <p className="service-card__desc">{s.desc}</p>
              </div>

              <div className="service-card__footer">
                <span className="service-card__link">Открыть</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Services;