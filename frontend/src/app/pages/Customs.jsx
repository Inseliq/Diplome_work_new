import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  TOURNAMENT_TYPES,
  TOURNAMENT_STATUS,
  PRIZE_TYPES,
  TIER_ROMAN,
  FORMATS,
  TIERS,
} from '../data/customsData';

import { useCustomTournaments } from '../hooks/useTournaments';
import { useAuth } from '../context/AuthContext';

function PrizeLabel({ prize }) {
  if (!prize) return null;

  const pt = PRIZE_TYPES[prize.type];

  if (!pt) {
    return (
      <span className="custom-prize">
        {prize.text || prize.amount || 'Приз'}
      </span>
    );
  }

  if (prize.type === 'any') {
    return (
      <span className="custom-prize" style={{ color: pt.color }}>
        {prize.text || 'Любой'}
      </span>
    );
  }

  return (
    <span className="custom-prize" style={{ color: pt.color }}>
      {prize.amount.toLocaleString('ru-RU')} {pt.label}
    </span>
  );
}

function ClassBadge({ classes }) {
  if (!classes?.length) return null;

  return (
    <span className="custom-card__class">
      {classes.join(' + ')}
    </span>
  );
}


function TournamentCard({ t, isAuthenticated }) {
  const type = TOURNAMENT_TYPES[t.type] || TOURNAMENT_TYPES.common;
  const status = TOURNAMENT_STATUS[t.status] || TOURNAMENT_STATUS.upcoming;

  const showStream = t.isStream && t.status === 'active' && t.streamUrl;
  const showResults = t.status === 'finished' || (t.status === 'active' && !t.isStream);
  const showRegister = t.status === 'registration' && t.openForAll;

  const registerUrl = `/tournaments/custom/register/${t.id}`;

  const registerPath = isAuthenticated
    ? registerUrl
    : `/login?returnUrl=${encodeURIComponent(registerUrl)}`;

  return (
    <div
      className="custom-card"
      style={{
        '--type-color': type.color,
        '--type-glow': type.glow,
        '--type-border': type.border,
      }}
    >
      <div className="custom-card__stripe" />

      <div className="custom-card__head">
        <div className="custom-card__badges">
          <span
            className="custom-card__type-badge"
            style={{
              color: type.color,
              borderColor: type.border,
              background: type.glow,
            }}
          >
            {type.label}
          </span>

          <span
            className="custom-card__status"
            style={{
              color: status.color,
              background: status.bg,
              borderColor: status.border,
            }}
          >
            <span
              className="custom-card__status-dot"
              style={{ background: status.color }}
            />
            {status.label}
          </span>

          {t.isStream && (
            <span className="custom-card__live-badge">
              <span className="custom-card__live-dot" />
              LIVE
            </span>
          )}
        </div>

        <ClassBadge classes={t.classes} />
      </div>

      <h3 className="custom-card__title">{t.name}</h3>
      <p className="custom-card__desc">{t.description}</p>

      <div className="custom-card__meta">
        <div className="custom-card__meta-item">
          <span className="custom-card__meta-label">Формат</span>
          <span className="custom-card__meta-val custom-card__format">
            {t.format}
            {t.reserveSize > 0 && (
              <span className="custom-card__reserve"> +{t.reserveSize}</span>
            )}
          </span>
        </div>

        <div className="custom-card__meta-item">
          <span className="custom-card__meta-label">Уровень</span>
          <span className="custom-card__meta-val">
            {TIER_ROMAN[t.tier] ?? t.tier}
          </span>
        </div>

        <div className="custom-card__meta-item">
          <span className="custom-card__meta-label">Команды</span>
          <span className="custom-card__meta-val">
            {t.currentParticipants}
            {t.maxParticipants ? <> / {t.maxParticipants}</> : ' / ∞'}
          </span>
        </div>

        <div className="custom-card__meta-item">
          <span className="custom-card__meta-label">Призы</span>
          <span className="custom-card__meta-val">
            {t.prizeText ? (
              <span
                style={{
                  color: 'var(--text-muted)',
                  fontSize: 'var(--text-xs)',
                }}
              >
                {t.prizeText}
              </span>
            ) : (
              <PrizeLabel prize={t.prizes?.place1} />
            )}
          </span>
        </div>
      </div>

      <div className="custom-card__dates">
        <div className="custom-card__date-item">
          <svg
            width="12"
            height="12"
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

          <span>
            {t.dateStart} — {t.dateEnd}
          </span>
        </div>

        {(t.status === 'registration' || t.status === 'upcoming') && (
          <div className="custom-card__date-item custom-card__date-item--reg">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>

            <span>Рег. до {t.regEnd}</span>
          </div>
        )}

        {t.openForAll && (
          <span className="custom-card__open-badge">
            Открытый
          </span>
        )}

        {t.sponsor && (
          <span className="custom-card__sponsor">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {t.sponsor}
          </span>
        )}
      </div>

      <div className="custom-card__actions">
        {showStream && (
          <a
            href={t.streamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-accent btn-sm"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Смотреть
          </a>
        )}

        {showRegister && (
          <Link to={registerPath} className="btn btn-primary btn-sm">
            <svg
              width="13"
              height="13"
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
            Участвовать
          </Link>
        )}

        {showResults && (
          <Link
            to={`/tournaments/custom/details/${t.id}`}
            className="btn btn-ghost btn-sm"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Результаты
          </Link>
        )}

        <Link
          to={`/tournaments/custom/details/${t.id}`}
          className="btn btn-ghost btn-sm"
        >
          Подробнее →
        </Link>
      </div>
    </div>
  );
}

function CustomsEmptyBanner() {
  return (
    <div
      className="marks__table-wrap reveal reveal--visible"
      style={{ padding: '32px', textAlign: 'center' }}
    >
      <h2>К сожалению, турниров пока нет.</h2>
      <p>Пожалуйста, зайдите позже.</p>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginTop: '20px',
          flexWrap: 'wrap',
        }}
      >
        <Link className="btn btn-primary" to="/">
          На главную
        </Link>

        <Link className="btn btn-ghost" to="/">
          Подождать
        </Link>
      </div>
    </div>
  );
}

function Customs() {
  const { tournaments, loading, error } = useCustomTournaments();
  const { isAuthenticated } = useAuth();

  const [filterFormat, setFilterFormat] = useState([]);
  const [filterType, setFilterType] = useState([]);
  const [filterTier, setFilterTier] = useState([]);

  const toggle = (arr, setArr, val) => {
    setArr(arr.includes(val)
      ? arr.filter((x) => x !== val)
      : [...arr, val]);
  };

  const filtered = useMemo(() => {
    let list = [...tournaments];

    const order = {
      active: 0,
      registration: 1,
      upcoming: 2,
      finished: 3,
    };

    list.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));

    if (filterFormat.length) {
      list = list.filter((t) => filterFormat.includes(t.format));
    }

    if (filterType.length) {
      list = list.filter((t) => filterType.includes(t.type));
    }

    if (filterTier.length) {
      list = list.filter((t) => filterTier.includes(t.tier));
    }

    return list;
  }, [tournaments, filterFormat, filterType, filterTier]);

  const hasFilters = Boolean(
    filterFormat.length || filterType.length || filterTier.length
  );

  return (
    <div className="wrapper customs">
      <div className="container">
        <div className="customs__header reveal">
          <div className="customs__header-label">Турниры</div>
          <h1 className="customs__title">Кастомные турниры</h1>
          <p className="customs__subtitle">
            Турниры от клана EVG и сообщества CosmoManager
          </p>
        </div>

        {loading && (
          <div className="customs__empty reveal">
            Загружаем турниры...
          </div>
        )}

        {!loading && (error || tournaments.length === 0) && (
          <CustomsEmptyBanner />
        )}

        {!error && tournaments.length > 0 && (
          <>
            <div className="customs__filters reveal">
              <div className="customs__filter-group">
                <div className="customs__filter-label">Формат</div>
                <div className="customs__filter-pills">
                  {FORMATS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={`customs__pill${filterFormat.includes(f) ? ' customs__pill--active' : ''}`}
                      onClick={() => toggle(filterFormat, setFilterFormat, f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="customs__filter-group">
                <div className="customs__filter-label">Тип</div>
                <div className="customs__filter-pills">
                  {Object.entries(TOURNAMENT_TYPES).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      className={`customs__pill${filterType.includes(key) ? ' customs__pill--active' : ''}`}
                      onClick={() => toggle(filterType, setFilterType, key)}
                      style={
                        filterType.includes(key)
                          ? {
                            borderColor: val.color,
                            color: val.color,
                            background: val.glow,
                          }
                          : {}
                      }
                    >
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="customs__filter-group">
                <div className="customs__filter-label">Уровень</div>
                <div className="customs__filter-pills">
                  {TIERS.map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      className={`customs__pill customs__pill--tier${filterTier.includes(tier) ? ' customs__pill--active' : ''}`}
                      onClick={() => toggle(filterTier, setFilterTier, tier)}
                    >
                      {TIER_ROMAN[tier]}
                    </button>
                  ))}
                </div>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm customs__filter-reset"
                  onClick={() => {
                    setFilterFormat([]);
                    setFilterType([]);
                    setFilterTier([]);
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
                  </svg>
                  Сбросить
                </button>
              )}
            </div>

            <div className="customs__counter reveal">
              <span>
                Показано <strong>{filtered.length}</strong> из{' '}
                <strong>{tournaments.length}</strong> турниров
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="customs__empty reveal">
                Турниры не найдены. Измените фильтры.
              </div>
            ) : (
              <div className="customs__grid reveal">
                {filtered.map((t) => (
                  <TournamentCard
                    key={t.id}
                    t={t}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Customs;