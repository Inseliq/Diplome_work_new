import React, { useState, useMemo, useEffect } from 'react';
import { useMasters } from '../hooks/useMasters';
import {
  NATION_LABELS, TYPE_SVG, MASTERY_SVG,
  NATION_KEYS, TIERS, TIER_ROMAN,
} from '../data/mastersData';
import { LoadingSpinner, FallbackBanner } from '../components/ui/StatusComponents';

/* ── SVG-заготовки наций ── */
const NATION_ICONS = {
  ussr: { src: '/images/nations/ussr.svg', alt: 'СССР' },
  germany: { src: '/images/nations/germany.svg', alt: 'Германия' },
  usa: { src: '/images/nations/usa.svg', alt: 'США' },
  china: { src: '/images/nations/china.svg', alt: 'Китай' },
  france: { src: '/images/nations/france.svg', alt: 'Франция' },
  uk: { src: '/images/nations/uk.svg', alt: 'Великобритания' },
  japan: { src: '/images/nations/japan.svg', alt: 'Япония' },
  czech: { src: '/images/nations/czech.svg', alt: 'Чехословакия' },
  sweden: { src: '/images/nations/sweden.svg', alt: 'Швеция' },
  poland: { src: '/images/nations/poland.svg', alt: 'Польша' },
  italy: { src: '/images/nations/italy.svg', alt: 'Италия' },
  intunion: { src: '/images/nations/intunion.svg', alt: 'Сборная нация' },
};

/* Порядок типов */
const TYPE_ORDER = ['heavyTank', 'mediumTank', 'lightTank', 'AT-SPG', 'SPG'];

/* Цвет названия танка по типу */
const TANK_NAME_COLOR = (tank) => {
  if (tank.is_premium) return '#FFD700';
  if (tank.is_special) return '#00FFFF';
  if (tank.is_collector) return '#32CD32';
  return null;
};

function fmt(val) {
  if (val == null) return <span className="masters-table__null">—</span>;
  return val.toLocaleString('ru-RU');
}

function SortIcon({ col, sortCol, sortDir }) {
  const active = sortCol === col;
  return (
    <span className={`masters-table__sort-icon${active ? ' masters-table__sort-icon--active' : ''}`}>
      {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );
}

function NationImg({ nation, className }) {
  const icon = NATION_ICONS[nation];
  if (!icon) return null;
  return (
    <img src={icon.src} alt={icon.alt} className={className}
      onError={(e) => { e.target.style.opacity = '0.3'; }} />
  );
}

/* SVG с fallback-текстом */
function TypeImg({ type, className }) {
  const src = TYPE_SVG[type];
  if (!src) return null;
  return (
    <img src={src} alt={type} className={className}
      onError={(e) => { e.target.style.opacity = '0.3'; }} />
  );
}

function MasteryImg({ field, className }) {
  const src = MASTERY_SVG[field];
  if (!src) return null;
  return (
    <img src={src} alt={field} className={className}/>
  );
}

function Masters() {
  const { tanks, loading, isFallback } = useMasters();

  const [nations, setNations] = useState([]);
  const [types, setTypes] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [sortCol, setSortCol] = useState('master');
  const [sortDir, setSortDir] = useState('desc');

  /* Сохраняем фильтры в localStorage */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('mastersFilters') || '{}');
    if (saved.nations) setNations(saved.nations);
    if (saved.types) setTypes(saved.types);
    if (saved.tiers) setTiers(saved.tiers);
  }, []);

  useEffect(() => {
    localStorage.setItem('mastersFilters', JSON.stringify({ nations, types, tiers }));
  }, [nations, types, tiers]);

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const rows = useMemo(() => {
    let list = [...tanks];

    if (nations.length) list = list.filter((t) => nations.includes(t.nation));
    if (types.length) list = list.filter((t) => types.includes(t.type));
    if (tiers.length) list = list.filter((t) => tiers.includes(t.tier));

    list.sort((a, b) => {
      const va = a[sortCol], vb = b[sortCol];
      let diff;
      if (va == null && vb == null) diff = 0;
      else if (va == null) diff = -1;
      else if (vb == null) diff = 1;
      else if (typeof va === 'string') diff = va.localeCompare(vb, 'ru');
      else diff = va - vb;
      return sortDir === 'asc' ? diff : -diff;
    });

    return list;
  }, [tanks, nations, types, tiers, sortCol, sortDir]);

  const hasFilters = !!(nations.length || types.length || tiers.length);

  /* Колонки — степени мастерства */
  const COLUMNS = [
    { key: 'nation', label: 'Нация', sortable: true },
    { key: 'type', label: 'Тип', sortable: true },
    { key: 'tier', label: 'Уровень', sortable: true },
    { key: 'name', label: 'Танк', sortable: true },
    { key: 'deg3', label: 'deg3', sortable: true, svg: 'deg3' },
    { key: 'deg2', label: 'deg2', sortable: true, svg: 'deg2' },
    { key: 'deg1', label: 'deg1', sortable: true, svg: 'deg1' },
    { key: 'master', label: 'master', sortable: true, svg: 'master' },
  ];

  return (
    <div className="wrapper masters">
      <div className="container">

        {/* Header */}
        <div className="masters__header reveal">
          <div className="masters__header-label">Достижения</div>
          <h1 className="masters__title">Знак классности</h1>
          <p className="masters__subtitle">
            Сколько опыта нужно заработать для получения знака классности
          </p>
        </div>

        {isFallback && <FallbackBanner />}

        {/* Filters */}
        <div className="masters__filters reveal">
          <div className="masters__filter-groups">

            {/* Нации */}
            <div className="masters__filter-group">
              <div className="masters__filter-label">Нация</div>
              <div className="masters__filter-pills masters__filter-pills--nations">
                {NATION_KEYS.map((n) => (
                  <button key={n}
                    className={`masters__pill masters__pill--nation${nations.includes(n) ? ' masters__pill--active' : ''}`}
                    onClick={() => toggle(nations, setNations, n)}
                    title={NATION_LABELS[n]}
                  >
                    <NationImg nation={n} className="masters__pill-img" />
                    <span className="masters__pill-text">{NATION_LABELS[n]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="masters__filter-row">

              {/* Тип — SVG иконка */}
              <div className="masters__filter-group">
                <div className="masters__filter-label">Тип</div>
                <div className="masters__filter-pills">
                  {TYPE_ORDER.map((t) => (
                    <button key={t}
                      className={`masters__pill masters__pill--type${types.includes(t) ? ' masters__pill--active' : ''}`}
                      onClick={() => toggle(types, setTypes, t)}
                      title={t}
                    >
                      <TypeImg type={t} className="masters__pill-type-img" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Уровень — II..XI со звёздочкой */}
              <div className="masters__filter-group">
                <div className="masters__filter-label">Уровень</div>
                <div className="masters__filter-pills">
                  {TIERS.map((tier) => (
                    <button key={tier}
                      className={`masters__pill masters__pill--tier${tiers.includes(tier) ? ' masters__pill--active' : ''}`}
                      onClick={() => toggle(tiers, setTiers, tier)}
                    >
                      {TIER_ROMAN[tier]}
                    </button>
                  ))}
                </div>
              </div>

              {hasFilters && (
                <button className="btn btn-ghost btn-sm masters__reset"
                  onClick={() => { setNations([]); setTypes([]); setTiers([]); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.5" />
                  </svg>
                  Сбросить
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Counter */}
        <div className="masters__counter reveal">
          Показано <strong>{rows.length}</strong> из <strong>{tanks.length}</strong> машин
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSpinner text="Загружаем данные мастерства..." />
        ) : (
          <div className="masters__table-wrap reveal">
            <table className="masters-table">
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th key={col.key}
                      className={`masters-table__th${col.sortable ? ' masters-table__th--sortable' : ''}${sortCol === col.key ? ' masters-table__th--sorted' : ''}`}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    >
                      <span className="masters-table__th-inner">
                        {/* Степени мастерства — SVG иконка */}
                        {col.svg ? (
                          <MasteryImg field={col.svg} className="masters-table__th-svg" />
                        ) : (
                          col.label
                        )}
                        {col.sortable && <SortIcon col={col.key} sortCol={sortCol} sortDir={sortDir} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="masters-table__empty">
                      Ничего не найдено. Измените фильтры.
                    </td>
                  </tr>
                ) : rows.map((tank) => {
                  const nameColor = TANK_NAME_COLOR(tank);
                  return (
                    <tr key={tank.tank_id} className="masters-table__row">

                      {/* Нация */}
                      <td className="masters-table__td masters-table__td--nation">
                        <NationImg nation={tank.nation} className="masters-table__nation-img" />
                      </td>

                      {/* Тип */}
                      <td className="masters-table__td masters-table__td--type">
                        <TypeImg type={tank.type} className="masters-table__type-img" />
                      </td>

                      {/* Уровень */}
                      <td className="masters-table__td masters-table__td--tier">
                        <span className="masters-table__tier">
                          {TIER_ROMAN[tank.tier] ?? tank.tier}
                        </span>
                      </td>

                      {/* Название с цветом */}
                      <td className="masters-table__td masters-table__td--name"
                        style={nameColor ? { color: nameColor } : {}}>
                        {tank.name}
                        {tank.is_premium && <span className="masters-table__tag masters-table__tag--premium">P</span>}
                        {tank.is_special && <span className="masters-table__tag masters-table__tag--special">S</span>}
                        {tank.is_collector && <span className="masters-table__tag masters-table__tag--collector">C</span>}
                      </td>

                      {/* Степени мастерства */}
                      <td className="masters-table__td masters-table__td--mastery masters-table__td--deg3">{fmt(tank.deg3)}</td>
                      <td className="masters-table__td masters-table__td--mastery masters-table__td--deg2">{fmt(tank.deg2)}</td>
                      <td className="masters-table__td masters-table__td--mastery masters-table__td--deg1">{fmt(tank.deg1)}</td>
                      <td className="masters-table__td masters-table__td--mastery masters-table__td--master">{fmt(tank.master)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

export default Masters;