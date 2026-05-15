import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useDirectoryVehicle } from '../hooks/useDirectoryVehicle';
import { LoadingSpinner } from '../components/ui/StatusComponents';
import {
  POLEVAYA_ITEMS,
  EQUIPMENT,
  EQUIPMENT_TIER_COLORS,
  getEquipmentTier,
  SECTION_LABELS,
  getPolevayaSectionCount,
  ROLE_LABELS,
  TYPE_ROLE_ICONS,
  BUILD_LABELS,
  STATE_LABELS,
} from '../data/directoryData';

// ─── Константы ──────────────────────────────────────────────────

const TIER_ROMAN = {
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

const TYPE_LABELS = {
  heavyTank: 'ТТ',
  mediumTank: 'СТ',
  lightTank: 'ЛТ',
  'AT-SPG': 'ПТ',
  SPG: 'САУ',
};

const TYPE_IMG_KEY = {
  heavyTank: 'heavy_tank',
  mediumTank: 'medium_tank',
  lightTank: 'light_tank',
  'AT-SPG': 'at_spg',
  SPG: 'spg',
};

// ─── Модуль полевой ─────────────────────────────────────────────

function PolevayaModule({ itemKey, selected }) {
  const item = POLEVAYA_ITEMS[itemKey];
  const src = item?.img ?? '/images/polevaya/placeholder.png';
  const alt = item?.label ?? itemKey;

  return (
    <div className={`pm-card${selected ? ' pm-card--selected' : ''}`}>
      <div className="pm-card__img-wrap">
        <img
          src={src}
          alt={alt}
          onError={(e) => {
            e.target.style.opacity = '0.15';
          }}
        />

        {selected && (
          <div className="pm-card__check">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
      </div>

      <span className="pm-card__label">{alt}</span>
    </div>
  );
}

// ─── Секция полевой модернизации ─────────────────────────────────

function PolevayaGroup({ sectionKey, items }) {
  const label = SECTION_LABELS[sectionKey] ?? sectionKey;

  return (
    <div className="pm-group">
      <div className="pm-group__header">
        <span className="pm-group__num">{label}</span>
        <div className="pm-group__line" />
      </div>

      <div className="pm-group__modules">
        {items.map(([itemKey, selected], index) => (
          <PolevayaModule
            key={`${sectionKey}-${itemKey}-${index}`}
            itemKey={itemKey}
            selected={Boolean(selected)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Слот оборудования ───────────────────────────────────────────

function EqSlot({ itemKey }) {
  const item = EQUIPMENT[itemKey];
  const tier = getEquipmentTier(itemKey);
  const colors = EQUIPMENT_TIER_COLORS[tier] ?? EQUIPMENT_TIER_COLORS.std;
  const tierClass = `eq-slot--${tier}`;

  return (
    <div className={`eq-slot ${tierClass}`} title={item?.label ?? itemKey}>
      <div
        className="eq-slot__tier-icon"
        style={{
          background: colors.bg,
          borderColor: colors.border,
        }}
      >
        <svg width="8" height="8" viewBox="0 0 8 8">
          <polygon points="4,0 8,8 0,8" fill={colors.color} />
        </svg>
      </div>

      <div
        className="eq-slot__img-wrap"
        style={{
          borderColor: colors.border,
          background: colors.bg,
        }}
      >
        {item ? (
          <img
            src={item.img}
            alt={item.label}
            onError={(e) => {
              e.target.style.opacity = '0.15';
            }}
          />
        ) : (
          <span className="eq-slot__placeholder">?</span>
        )}
      </div>
    </div>
  );
}

// ─── Группа оборудования ─────────────────────────────────────────

function EquipGroup({ modeKey, builds }) {
  const cfg = BUILD_LABELS[modeKey] ?? {
    label: modeKey,
    color: '#888',
  };

  if (!builds) return null;

  const states = Object.entries(builds).filter(([, items]) => items?.length);

  if (!states.length) return null;

  return (
    <div className="eq-group" style={{ '--mode-color': cfg.color }}>
      <div className="eq-group__title">
        <div
          className="eq-group__title-dot"
          style={{ background: cfg.color }}
        />
        {cfg.label}
      </div>

      <div className="eq-group__rows">
        {states.map(([stateKey, items]) => {
          const stateConfig = STATE_LABELS[stateKey] ?? {
            label: stateKey,
            color: '#888',
            icon: '◆',
          };

          return (
            <div key={stateKey} className="eq-row">
              <div className="eq-row__slots">
                {items.map((key, index) => (
                  <EqSlot key={`${stateKey}-${key}-${index}`} itemKey={key} />
                ))}
              </div>

              <div className="eq-row__label-icons" title={stateConfig.label}>
                <div className="eq-row__mode-icons">
                  {['icon1', 'icon2', 'icon3'].map((icon, index) => (
                    <div key={`${icon}-${index}`} className="eq-row__mode-icon" />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Главный компонент ───────────────────────────────────────────

function TankDirectory() {
  const { id } = useParams();

  const {
    directoryVehicle,
    loading,
    error,
    reload,
  } = useDirectoryVehicle(id);

  const [isContentRevealed, setIsContentRevealed] = useState(false);

  useEffect(() => {
    if (loading || error || !directoryVehicle) {
      setIsContentRevealed(false);
      return;
    }

    let frame1;
    let frame2;

    setIsContentRevealed(false);

    frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        setIsContentRevealed(true);
      });
    });

    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, [loading, error, directoryVehicle]);

  if (loading) {
    return (
      <div className="wrapper tank-directory">
        <div className="container">
          <LoadingSpinner text="Загружаем данные танка..." />
        </div>
      </div>
    );
  }

  if (error?.status === 404) {
    return (
      <Navigate
        to={`/development?src-page=${encodeURIComponent('/directory')}`}
        replace
      />
    );
  }

  if (error || !directoryVehicle) {
    return (
      <div className="wrapper tank-directory">
        <div className="container">
          <div
            className="dir__equipment-zone reveal reveal--visible"
            style={{ padding: '32px', textAlign: 'center' }}
          >
            <h2>К сожалению не удалось загрузить данные с сервера.</h2>
            <p>Пожалуйста попробуйте перезагрузить.</p>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                marginTop: '20px',
              }}
            >
              <button className="btn btn-primary" onClick={reload}>
                Попробовать снова
              </button>

              <Link className="btn btn-ghost" to="/">
                На главную
              </Link>

              <Link className="btn btn-ghost" to="/directory">
                Каталог танков
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const dirData = directoryVehicle;
  const tank = directoryVehicle.vehicle;

  const tier = tank?.tier ?? 10;
  const role = tank?.role ?? '';

  const sectionCount = getPolevayaSectionCount(tier);
  const leftSects = ['section1', 'section2', 'section3'].slice(
    0,
    Math.min(sectionCount, 3)
  );
  const rightSects = ['section4', 'section5'].slice(
    0,
    Math.max(sectionCount - 3, 0)
  );

  const typeKey = TYPE_IMG_KEY[tank?.type] ?? 'heavy_tank';
  const roleLabel = ROLE_LABELS[role] ?? '';
  const tankImage = dirData.image ?? tank?.iconUrl;

  return (
    <div className="wrapper tank-directory">
      <div className="container">
        <nav className={`dir__breadcrumb reveal${isContentRevealed ? ' reveal--visible' : ''}`}>
          <Link to="/directory" className="dir__crumb">
            Каталог танков
          </Link>
          <span className="dir__crumb-sep">/</span>
          <span className="dir__crumb dir__crumb--active">
            {tank?.name ?? `Танк #${id}`}
          </span>
        </nav>

        {sectionCount > 0 && dirData.polevaya ? (
          <div className={`dir__polevaya-zone reveal${isContentRevealed ? ' reveal--visible' : ''}`}>
            <div className="dir__pm-left">
              {leftSects.map((sectionKey) => (
                dirData.polevaya?.[sectionKey] ? (
                  <PolevayaGroup
                    key={sectionKey}
                    sectionKey={sectionKey}
                    items={dirData.polevaya[sectionKey]}
                  />
                ) : null
              ))}
            </div>

            <div className="dir__center">
              <div className="dir__tank-wrap">
                <img
                  src={tankImage}
                  alt={tank?.name ?? `Танк #${id}`}
                  className="dir__tank-img"
                  onError={(e) => {
                    e.target.style.opacity = '0.1';
                  }}
                />
              </div>

              <div className="dir__tank-info">
                <div className="dir__tank-meta">
                  <span className="dir__tank-tier">
                    {TIER_ROMAN[tier] ?? tier}
                  </span>

                  {tank && (
                    <img
                      src={`/images/types/${typeKey}.svg`}
                      alt={TYPE_LABELS[tank.type] ?? ''}
                      className="dir__tank-type-icon"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </div>

                <h1 className="dir__tank-name">
                  {tank?.name ?? `Танк #${id}`}
                </h1>

                {roleLabel && (
                  <p className="dir__tank-role">{roleLabel}</p>
                )}
              </div>
            </div>

            <div className="dir__pm-right">
              {rightSects.map((sectionKey) => (
                dirData.polevaya?.[sectionKey] ? (
                  <PolevayaGroup
                    key={sectionKey}
                    sectionKey={sectionKey}
                    items={dirData.polevaya[sectionKey]}
                  />
                ) : null
              ))}
            </div>
          </div>
        ) : (
          <div className={`dir__hero-simple reveal${isContentRevealed ? ' reveal--visible' : ''}`}>
            <div className="dir__tank-wrap dir__tank-wrap--simple">
              <img
                src={tankImage}
                alt={tank?.name ?? `Танк #${id}`}
                className="dir__tank-img"
                onError={(e) => {
                  e.target.style.opacity = '0.1';
                }}
              />
            </div>

            <div className="dir__tank-info">
              <div className="dir__tank-meta">
                <span className="dir__tank-tier">
                  {TIER_ROMAN[tier] ?? tier}
                </span>

                {tank && (
                  <img
                    src={`/images/types/${typeKey}.svg`}
                    alt={TYPE_LABELS[tank.type] ?? ''}
                    className="dir__tank-type-icon"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>

              <h1 className="dir__tank-name">
                {tank?.name ?? `Танк #${id}`}
              </h1>

              {roleLabel && (
                <p className="dir__tank-role">{roleLabel}</p>
              )}
            </div>
          </div>
        )}

        <div className={`dir__equipment-zone reveal${isContentRevealed ? ' reveal--visible' : ''}`}>
          <div className="dir__eq-groups">
            {dirData.battles?.random && (
              <EquipGroup
                modeKey="random"
                builds={dirData.battles.random}
              />
            )}

            {dirData.battles?.fortified && (
              <EquipGroup
                modeKey="fortified"
                builds={dirData.battles.fortified}
              />
            )}
          </div>

          {tank && (
            <div className="dir__type-badges">
              {Object.entries(TYPE_ROLE_ICONS).map(([type, src]) => (
                <div
                  key={type}
                  className={`dir__type-badge${tank.type === type ? ' dir__type-badge--active' : ''}`}
                  title={TYPE_LABELS[type]}
                >
                  <img
                    src={src}
                    alt={TYPE_LABELS[type]}
                    onError={(e) => {
                      e.target.style.opacity = '0.3';
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`dir__back reveal${isContentRevealed ? ' reveal--visible' : ''}`}>
          <Link to="/directory" className="btn btn-ghost">
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
            Каталог танков
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TankDirectory;