import React from 'react';
import { Link } from 'react-router-dom';

const CLAN_CARDS = [
  {
    to: '/clan/global-map',
    icon: '🗺️',
    title: 'Глобальная карта',
    desc: 'Управление боями на глобальной карте, захват провинций и стратегическое планирование.',
    color: 'var(--main-accent-effect)',
    glow: 'rgba(131,93,228,0.18)',
    tag: 'ГК',
  },
  {
    to: '/clan/reserves',
    icon: '⚡',
    title: 'Активация резервов',
    desc: 'Управление клановыми резервами — активация бонусов для всех участников клана.',
    color: 'var(--third-accent)',
    glow: 'rgba(250,184,27,0.18)',
    tag: 'Резервы',
  },
  {
    to: '/achievements/clan',
    icon: '🏅',
    title: 'Клановые достижения',
    desc: 'Медали, ордена и достижения клана за бои на глобальной карте и турниры.',
    color: 'var(--second-accent)',
    glow: 'rgba(255,80,0,0.18)',
    tag: 'Достижения',
  },
  {
    to: '/clan/events',
    icon: '🗓️',
    title: 'Информация о событиях',
    desc: 'Актуальные события клана: кланваты, тренировки, рейды и специальные операции.',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.18)',
    tag: 'События',
  },
];

function Clan() {
  return (
    <div className="wrapper clan">
      <div className="container">

        <div className="clan__header reveal">
          <div className="clan__header-label">EVG</div>
          <h1 className="clan__title">Клан</h1>
          <p className="clan__subtitle">
            Инструменты для командира и офицеров — управление, планирование, аналитика
          </p>
        </div>

        <div className="clan__grid reveal">
          {CLAN_CARDS.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="service-card"
              style={{ '--card-color': c.color, '--card-glow': c.glow }}
            >
              <div className="service-card__glow-bg" />

              <div className="service-card__top-row">
                <div className="service-card__icon-wrap">
                  <span className="service-card__icon">{c.icon}</span>
                </div>
                <span className="service-card__tag" style={{ color: c.color }}>{c.tag}</span>
              </div>

              <div className="service-card__body">
                <h3 className="service-card__title">{c.title}</h3>
                <p className="service-card__desc">{c.desc}</p>
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

export default Clan;