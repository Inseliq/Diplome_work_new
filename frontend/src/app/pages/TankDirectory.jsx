import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import {
  DIRECTORY_MAP,
  POLEVAYA_ITEMS,
  EQUIPMENT, EQUIPMENT_TIER_COLORS, getEquipmentTier,
  SECTION_LABELS, getPolevayaSectionCount,
  ROLE_LABELS, TYPE_ROLE_ICONS,
  BUILD_LABELS, STATE_LABELS,
} from '../data/directoryData';

// ─── Константы ──────────────────────────────────────────────────

const TIER_ROMAN = { 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI' };

const NATION_LABELS = {
  ussr: 'СССР', germany: 'Германия', usa: 'США', china: 'Китай',
  france: 'Франция', uk: 'Великобритания', japan: 'Япония',
  czech: 'Чехословакия', sweden: 'Швеция', poland: 'Польша',
  italy: 'Италия', intunion: 'Сборная нация',
};

const TYPE_LABELS = {
  heavyTank: 'ТТ', mediumTank: 'СТ', lightTank: 'ЛТ', 'AT-SPG': 'ПТ', SPG: 'САУ',
};

const TYPE_IMG_KEY = {
  heavyTank: 'heavy_tank', mediumTank: 'medium_tank',
  lightTank: 'light_tank', 'AT-SPG': 'at_spg', SPG: 'spg',
};

// ─── Модуль полевой (карточка с картинкой) ──────────────────────

function PolevayaModule({ itemKey, selected }) {
  const item = POLEVAYA_ITEMS[itemKey];
  const src = item?.img ?? '/images/polevaya/placeholder.png';
  const alt = item?.label ?? itemKey;

  return (
    <div className={`pm-card${selected ? ' pm-card--selected' : ''}`}>
      <div className="pm-card__img-wrap">
        <img src={src} alt={alt} onError={(e) => { e.target.style.opacity = '0.15'; }} />
        {selected && (
          <div className="pm-card__check">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="3">
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
        {items.map(([itemKey, selected], i) => (
          <PolevayaModule key={i} itemKey={itemKey} selected={!!selected} />
        ))}
      </div>
    </div>
  );
}

// ─── Слот оборудования ───────────────────────────────────────────

function EqSlot({ itemKey }) {
  const item = EQUIPMENT[itemKey];
  const tier = getEquipmentTier(itemKey);
  const colors = EQUIPMENT_TIER_COLORS[tier];

  const tierClass = `eq-slot--${tier}`;

  return (
    <div className={`eq-slot ${tierClass}`} title={item?.label ?? itemKey}>
      <div className="eq-slot__tier-icon" style={{ background: colors.bg, borderColor: colors.border }}>
        <svg width="8" height="8" viewBox="0 0 8 8">
          <polygon points="4,0 8,8 0,8" fill={colors.color} />
        </svg>
      </div>
      <div className="eq-slot__img-wrap" style={{ borderColor: colors.border, background: colors.bg }}>
        {item
          ? <img src={item.img} alt={item.label}
            onError={(e) => { e.target.style.opacity = '0.15'; }} />
          : <span className="eq-slot__placeholder">?</span>
        }
      </div>
    </div>
  );
}

// ─── Группа оборудования (рандом или укреп) ──────────────────────

function EquipGroup({ modeKey, builds }) {
  const cfg = BUILD_LABELS[modeKey] ?? { label: modeKey, color: '#888' };
  if (!builds) return null;

  // Определяем что показывать: state1, state2, default
  const states = Object.entries(builds).filter(([, v]) => v?.length);
  if (!states.length) return null;

  return (
    <div className="eq-group" style={{ '--mode-color': cfg.color }}>
      <div className="eq-group__title">
        <div className="eq-group__title-dot" style={{ background: cfg.color }} />
        {cfg.label}
      </div>

      <div className="eq-group__rows">
        {states.map(([stateKey, items]) => {
          const scfg = STATE_LABELS[stateKey] ?? { label: stateKey, color: '#888', icon: '◆' };
          return (
            <div key={stateKey} className="eq-row">
              <div className="eq-row__slots">
                {items.map((key, i) => <EqSlot key={i} itemKey={key} />)}
              </div>
              <div className="eq-row__label-icons">
                {/* 3 иконки режима снизу */}
                <div className="eq-row__mode-icons">
                  {['icon1', 'icon2', 'icon3'].map((ic, i) => (
                    <div key={i} className="eq-row__mode-icon" />
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
  const { vehicles } = useVehicles();

  const numId = Number(id);
  const dirData = DIRECTORY_MAP.get(numId);
  if (!dirData) return <Navigate to="/directory" replace />;

  const tank = vehicles.find((v) => v.id === numId) ?? null;
  const tier = tank?.tier ?? 10;
  const role = tank?.role ?? '';

  const sectionCount = getPolevayaSectionCount(tier);
  const leftSects = ['section1', 'section2', 'section3'].slice(0, Math.min(sectionCount, 3));
  const rightSects = ['section4', 'section5'].slice(0, Math.max(sectionCount - 3, 0));

  const typeKey = TYPE_IMG_KEY[tank?.type] ?? 'heavy_tank';
  const roleLabel = ROLE_LABELS[role] ?? '';

  return (
    <div className="wrapper tank-directory">
      <div className="container">

        {/* Breadcrumb */}
        <nav className="dir__breadcrumb reveal">
          <Link to="/directory" className="dir__crumb">Каталог танков</Link>
          <span className="dir__crumb-sep">/</span>
          <span className="dir__crumb dir__crumb--active">{tank?.name ?? `Танк #${id}`}</span>
        </nav>

        {/* ══ ПОЛЕВАЯ МОДЕРНИЗАЦИЯ + ТАНК ══ */}
        {sectionCount > 0 && dirData.polevaya ? (
          <div className="dir__polevaya-zone reveal">

            {/* Левые секции */}
            <div className="dir__pm-left">
              {leftSects.map((sk) => dirData.polevaya[sk] && (
                <PolevayaGroup key={sk} sectionKey={sk} items={dirData.polevaya[sk]} />
              ))}
            </div>

            {/* Центр: танк */}
            <div className="dir__center">
              <div className="dir__tank-wrap">
                <img
                  src={dirData.image ?? tank?.iconUrl}
                  alt={tank?.name ?? `Танк #${id}`}
                  className="dir__tank-img"
                  onError={(e) => { e.target.style.opacity = '0.1'; }}
                />
              </div>
              <div className="dir__tank-info">
                <div className="dir__tank-meta">
                  <span className="dir__tank-tier">{TIER_ROMAN[tier] ?? tier}</span>
                  {tank && (
                    <img
                      src={`/images/types/${typeKey}.svg`}
                      alt={TYPE_LABELS[tank.type] ?? ''}
                      className="dir__tank-type-icon"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
                <h1 className="dir__tank-name">{tank?.name ?? `Танк #${id}`}</h1>
                {roleLabel && <p className="dir__tank-role">{roleLabel}</p>}
              </div>
            </div>

            {/* Правые секции */}
            <div className="dir__pm-right">
              {rightSects.map((sk) => dirData.polevaya[sk] && (
                <PolevayaGroup key={sk} sectionKey={sk} items={dirData.polevaya[sk]} />
              ))}
            </div>

          </div>
        ) : (
          /* Нет полевой — просто hero блок */
          <div className="dir__hero-simple reveal">
            <div className="dir__tank-wrap dir__tank-wrap--simple">
              <img
                src={dirData.image ?? tank?.iconUrl}
                alt={tank?.name ?? `Танк #${id}`}
                className="dir__tank-img"
                onError={(e) => { e.target.style.opacity = '0.1'; }}
              />
            </div>
            <div className="dir__tank-info">
              <div className="dir__tank-meta">
                <span className="dir__tank-tier">{TIER_ROMAN[tier] ?? tier}</span>
                {tank && (
                  <img src={`/images/types/${typeKey}.svg`} alt=""
                    className="dir__tank-type-icon"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                )}
              </div>
              <h1 className="dir__tank-name">{tank?.name ?? `Танк #${id}`}</h1>
              {roleLabel && <p className="dir__tank-role">{roleLabel}</p>}
            </div>
          </div>
        )}

        {/* ══ ОБОРУДОВАНИЕ ══ */}
        <div className="dir__equipment-zone reveal">

          <div className="dir__eq-groups">
            {/* Рандом */}
            {dirData.battles?.random && (
              <EquipGroup modeKey="random" builds={dirData.battles.random} />
            )}
            {/* Укреп */}
            {dirData.battles?.fortified && (
              <EquipGroup modeKey="fortified" builds={dirData.battles.fortified} />
            )}
          </div>

          {/* 5 значков типа техники */}
          {tank && (
            <div className="dir__type-badges">
              {Object.entries(TYPE_ROLE_ICONS).map(([type, src]) => (
                <div
                  key={type}
                  className={`dir__type-badge${tank.type === type ? ' dir__type-badge--active' : ''}`}
                  title={TYPE_LABELS[type]}
                >
                  <img src={src} alt={TYPE_LABELS[type]}
                    onError={(e) => { e.target.style.opacity = '0.3'; }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back */}
        <div className="dir__back reveal">
          <Link to="/directory" className="btn btn-ghost">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
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