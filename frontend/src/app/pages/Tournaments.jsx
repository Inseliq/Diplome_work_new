import React from 'react';
import { Link } from 'react-router-dom';

const TOURNAMENT_CARDS = [
  {
    to: '/tournaments/official',
    icon: '🏆',
    title: 'Официальные турниры',
    desc: 'Турниры от Lesta Games с официальными призами — расписание, регистрация и результаты.',
    color: 'var(--third-accent)',
    glow: 'rgba(250,184,27,0.18)',
    tag: 'Официальные',
    badges: ['Призы', 'Рейтинг', 'Сертификат'],
  },
  {
    to: '/tournaments/custom',
    icon: '⚔️',
    title: 'Кастомные турниры',
    desc: 'Пользовательские турниры от кланов и сообщества — создай своё соревнование или вступи в существующее.',
    color: 'var(--main-accent-effect)',
    glow: 'rgba(131,93,228,0.18)',
    tag: 'Кастомные',
    badges: ['Свои правила', 'Открытые', 'Бесплатно'],
  },
];

function Tournaments() {
  return (
    <div className="wrapper tournaments">
      <div className="container">

        <div className="tournaments__header reveal">
          <div className="tournaments__header-label">Соревнования</div>
          <h1 className="tournaments__title">Турниры</h1>
          <p className="tournaments__subtitle">
            Официальные соревнования и кастомные турниры сообщества
          </p>
        </div>

        <div className="tournaments__grid reveal">
          {TOURNAMENT_CARDS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="service-card service-card--large"
              style={{ '--card-color': t.color, '--card-glow': t.glow }}
            >
              <div className="service-card__glow-bg" />

              <div className="service-card__top-row">
                <div className="service-card__icon-wrap service-card__icon-wrap--lg">
                  <span className="service-card__icon">{t.icon}</span>
                </div>
                <span className="service-card__tag" style={{ color: t.color }}>{t.tag}</span>
              </div>

              <div className="service-card__body">
                <h3 className="service-card__title service-card__title--lg">{t.title}</h3>
                <p className="service-card__desc">{t.desc}</p>
              </div>

              <div className="service-card__badges">
                {t.badges.map((b) => (
                  <span key={b} className="service-card__badge" style={{ borderColor: t.color, color: t.color }}>
                    {b}
                  </span>
                ))}
              </div>

              <div className="service-card__footer">
                <span className="service-card__link">Перейти</span>
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

export default Tournaments;