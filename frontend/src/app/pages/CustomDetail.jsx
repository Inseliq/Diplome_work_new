import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';

import {
  TOURNAMENT_TYPES,
  TOURNAMENT_STATUS,
  PRIZE_TYPES,
  TIER_ROMAN,
} from '../data/customsData';

import { useCustomTournamentDetail } from '../hooks/useTournaments';
import { useAuth } from '../context/AuthContext';

function PrizeLine({ label, prize, icon }) {
  if (!prize) return null;

  const pt = PRIZE_TYPES[prize.type];

  if (!pt) {
    return (
      <div className="custom-detail__prize-row">
        <span className="custom-detail__prize-place">
          {icon} {label}
        </span>
        <span className="custom-detail__prize-val">
          {prize.text || prize.amount || 'Приз'}
        </span>
      </div>
    );
  }

  return (
    <div className="custom-detail__prize-row">
      <span className="custom-detail__prize-place">
        {icon} {label}
      </span>

      <span className="custom-detail__prize-val" style={{ color: pt.color }}>
        {prize.type === 'any'
          ? (prize.text || 'Любой приз')
          : `${prize.amount.toLocaleString('ru-RU')} ${pt.label}`}
      </span>
    </div>
  );
}

function MapCard({ map }) {
  return (
    <div className="custom-detail__map-card">
      <div className="custom-detail__map-thumb">
        <img
          src={map.image}
          alt={map.name}
          onError={(e) => {
            e.target.style.opacity = '0.3';
          }}
        />
        <div className="custom-detail__map-overlay" />
      </div>

      <span className="custom-detail__map-name">
        {map.name}
      </span>
    </div>
  );
}

function CustomDetail() {
  const { id } = useParams();

  const {
    tournament: t,
    loading,
  } = useCustomTournamentDetail(id);

  const { isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="wrapper custom-detail">
        <div className="container">
          <div className="customs__empty reveal">
            Загружаем турнир...
          </div>
        </div>
      </div>
    );
  }

  if (!t) {
    return <Navigate to="/tournaments/custom" replace />;
  }

  const type = TOURNAMENT_TYPES[t.type] || TOURNAMENT_TYPES.common;
  const status = TOURNAMENT_STATUS[t.status] || TOURNAMENT_STATUS.upcoming;

  const showStream = t.isStream && t.status === 'active' && t.streamUrl;
  const showRegister = t.status === 'registration' && t.openForAll;
  const showResults = t.status === 'finished';

  const registerUrl = `/tournaments/custom/register/${t.id}`;

  const registerPath = isAuthenticated
    ? registerUrl
    : `/login?returnUrl=${encodeURIComponent(registerUrl)}`;

  return (
    <div className="wrapper custom-detail">
      <div className="container">
        <nav className="custom-detail__breadcrumb reveal">
          <Link to="/" className="custom-detail__crumb">
            Главная
          </Link>
          <span>/</span>

          <Link to="/tournaments" className="custom-detail__crumb">
            Турниры
          </Link>
          <span>/</span>

          <Link to="/tournaments/custom" className="custom-detail__crumb">
            Кастомные
          </Link>
          <span>/</span>

          <span className="custom-detail__crumb custom-detail__crumb--active">
            {t.name}
          </span>
        </nav>

        <div
          className="custom-detail__hero reveal"
          style={{
            '--type-color': type.color,
            '--type-glow': type.glow,
            '--type-border': type.border,
          }}
        >
          <div className="custom-detail__hero-glow" />

          <div className="custom-detail__hero-top">
            <div className="custom-detail__hero-badges">
              <span
                className="custom-detail__type-badge"
                style={{
                  color: type.color,
                  borderColor: type.border,
                  background: type.glow,
                }}
              >
                {type.label}
              </span>

              <span
                className="custom-detail__status"
                style={{
                  color: status.color,
                  background: status.bg,
                  borderColor: status.border,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: status.color,
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                {status.label}
              </span>

              {t.isStream && (
                <span className="custom-card__live-badge">
                  <span className="custom-card__live-dot" />
                  LIVE
                </span>
              )}

              {t.openForAll && (
                <span className="custom-detail__open-badge">
                  Открытый
                </span>
              )}
            </div>

            {t.sponsor && (
              <div className="custom-detail__sponsor">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Спонсор: <strong>{t.sponsor}</strong>
              </div>
            )}
          </div>

          <h1 className="custom-detail__title">
            {t.name}
          </h1>

          <p className="custom-detail__desc">
            {t.description}
          </p>

          <div className="custom-detail__actions">
            {showStream && (
              <a
                href={t.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-accent"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Смотреть трансляцию
              </a>
            )}

            {showRegister && (
              <Link to={registerPath} className="btn btn-primary">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                Зарегистрироваться
              </Link>
            )}

            {showResults && (
              <button type="button" className="btn btn-ghost">
                Посмотреть результаты
              </button>
            )}
          </div>
        </div>

        <div className="custom-detail__layout reveal">
          <div className="custom-detail__main">
            <div className="custom-detail__section">
              <h2 className="custom-detail__section-title">
                Информация
              </h2>

              <div className="custom-detail__info-grid">
                {[
                  {
                    label: 'Формат',
                    value: `${t.format}${t.reserveSize > 0 ? ` + ${t.reserveSize} зап.` : ''}`,
                  },
                  {
                    label: 'Уровень',
                    value: TIER_ROMAN[t.tier] ?? t.tier,
                  },
                  {
                    label: 'Класс',
                    value: t.classes?.length ? t.classes.join(' + ') : 'Не указан',
                  },
                  {
                    label: 'Команд',
                    value: `${t.currentParticipants} / ${t.maxParticipants ?? '∞'}`,
                  },
                  {
                    label: 'Доступен',
                    value: t.openForAll ? 'Всем игрокам' : 'Только по приглашению',
                  },
                  {
                    label: 'Трансляция',
                    value: t.isStream ? 'Да' : 'Нет',
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="custom-detail__info-item">
                    <span className="custom-detail__info-label">
                      {label}
                    </span>
                    <span className="custom-detail__info-val">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="custom-detail__section">
              <h2 className="custom-detail__section-title">
                Даты
              </h2>

              <div className="custom-detail__dates-grid">
                <div className="custom-detail__date-block">
                  <div className="custom-detail__date-label">
                    Регистрация
                  </div>

                  <div className="custom-detail__date-range">
                    <span>{t.regStart}</span>
                    <span className="custom-detail__date-sep">→</span>
                    <span>{t.regEnd}</span>
                  </div>
                </div>

                <div className="custom-detail__date-block">
                  <div className="custom-detail__date-label">
                    Турнир
                  </div>

                  <div className="custom-detail__date-range">
                    <span>{t.dateStart}</span>
                    <span className="custom-detail__date-sep">→</span>
                    <span>{t.dateEnd}</span>
                  </div>
                </div>
              </div>
            </div>

            {t.maps?.length > 0 && (
              <div className="custom-detail__section">
                <h2 className="custom-detail__section-title">
                  Карты
                </h2>

                <div className="custom-detail__maps-grid">
                  {t.maps.map((map) => (
                    <MapCard key={map.name} map={map} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="custom-detail__sidebar">
            <div className="custom-detail__section custom-detail__section--prizes">
              <h2 className="custom-detail__section-title">
                Призовые места
              </h2>

              {t.prizeText && (
                <p className="custom-detail__prize-note">
                  {t.prizeText}
                </p>
              )}

              <div className="custom-detail__prizes">
                <PrizeLine
                  label="1 место"
                  prize={t.prizes?.place1}
                  icon="🥇"
                />
                <PrizeLine
                  label="2 место"
                  prize={t.prizes?.place2}
                  icon="🥈"
                />
                <PrizeLine
                  label="3 место"
                  prize={t.prizes?.place3}
                  icon="🥉"
                />
                <PrizeLine
                  label="Остальные"
                  prize={t.prizes?.others}
                  icon="🎖️"
                />
              </div>
            </div>

            {t.eventId && (
              <div className="custom-detail__section">
                <h2 className="custom-detail__section-title">
                  Событие
                </h2>

                <p className="custom-detail__event-note">
                  Этот турнир является частью события. Подробнее об условиях,
                  миссиях и дополнительных наградах:
                </p>

                <Link
                  to={`/events/${t.eventId}`}
                  className="btn btn-ghost custom-detail__event-link"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Открыть событие
                </Link>
              </div>
            )}

            <Link
              to="/tournaments/custom"
              className="btn btn-ghost custom-detail__back"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Все турниры
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default CustomDetail;