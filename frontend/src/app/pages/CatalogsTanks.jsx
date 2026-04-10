import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { DIRECTORY_MAP } from '../data/directoryData';
import { LoadingSpinner, FallbackBanner } from '../components/ui/StatusComponents';

// ─── Константы ──────────────────────────────────────────────────

const NATION_LABELS = {
  ussr: 'СССР',
  germany: 'Германия',
  usa: 'США',
  china: 'Китай',
  france: 'Франция',
  uk: 'Великобритания',
  japan: 'Япония',
  czech: 'Чехословакия',
  sweden: 'Швеция',
  poland: 'Польша',
  italy: 'Италия',
  intunion: 'Сборная нация',
};

const NATION_KEYS = Object.keys(NATION_LABELS);

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

const TYPE_LABELS = {
  heavyTank: 'ТТ',
  mediumTank: 'СТ',
  lightTank: 'ЛТ',
  'AT-SPG': 'ПТ',
  SPG: 'САУ',
};

const TYPE_ORDER = ['heavyTank', 'mediumTank', 'lightTank', 'AT-SPG', 'SPG'];

const TYPE_ICONS = {
  heavyTank: { src: '/images/types/heavy_tank.svg', alt: 'ТТ' },
  mediumTank: { src: '/images/types/medium_tank.svg', alt: 'СТ' },
  lightTank: { src: '/images/types/light_tank.svg', alt: 'ЛТ' },
  'AT-SPG': { src: '/images/types/at_spg.svg', alt: 'ПТ' },
  SPG: { src: '/images/types/spg.svg', alt: 'САУ' },
};

const TIERS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const TIER_ROMAN = { 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI' };

// ─── Helpers ────────────────────────────────────────────────────

function NationImg({ nation, className }) {
  const icon = NATION_ICONS[nation];
  if (!icon) return null;
  return <img src={icon.src} alt={icon.alt} className={className}
    onError={(e) => { e.target.style.opacity = '0.3'; }} />;
}

function TypeImg({ type, className }) {
  const icon = TYPE_ICONS[type];
  if (!icon) return null;
  return <img src={icon.src} alt={icon.alt} className={className}
    onError={(e) => { e.target.style.opacity = '0.3'; }} />;
}

function SortIcon({ col, sortCol, sortDir }) {
  const active = sortCol === col;
  return (
    <span className={`catalog-table__sort-icon${active ? ' catalog-table__sort-icon--active' : ''}`}>
      {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );
}

// ─── Component ──────────────────────────────────────────────────

function CatalogsTanks() {
  const { vehicles, loading, isFallback } = useVehicles();

  const [filterTypes, setFilterTypes] = useState([]);
  const [filterTiers, setFilterTiers] = useState([]);
  const [filterNations, setFilterNations] = useState([]);
  const [search, setSearch] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const searchTimer = useRef(null);

  // ── async debounced search ──
  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearchVal(v.toLowerCase().trim()), 300);
  };

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const rows = useMemo(() => {
    let list = [...vehicles];

    if (filterTypes.length) list = list.filter((v) => filterTypes.includes(v.type));
    if (filterTiers.length) list = list.filter((v) => filterTiers.includes(v.tier));
    if (filterNations.length) list = list.filter((v) => filterNations.includes(v.nation));
    if (searchVal) list = list.filter((v) => v.name.toLowerCase().includes(searchVal));

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
  }, [vehicles, filterTypes, filterTiers, filterNations, searchVal, sortCol, sortDir]);

  const hasFilters = filterTypes.length || filterTiers.length || filterNations.length || search;

  const COLUMNS = [
    { key: 'nation', label: 'Нация', sortable: true },
    { key: 'type', label: 'Тип', sortable: true },
    { key: 'tier', label: 'Ур.', sortable: true },
    { key: 'name', label: 'Танк', sortable: true },
    { key: 'actions', label: '', sortable: false },
  ];

  return (
    <div className="wrapper catalogs">
      <div className="container">

        {/* Header */}
        <div className="catalogs__header reveal">
          <div className="catalogs__header-label">Техника</div>
          <h1 className="catalogs__title">Каталог танков</h1>
          <p className="catalogs__subtitle">
            Сборки оборудования и полевые модернизации для техники
          </p>
        </div>

        {isFallback && <FallbackBanner />}

        {/* ── Filters ── */}
        <div className="catalogs__filters reveal">

          {/* Поиск */}
          <div className="catalogs__search-wrap">
            <svg className="catalogs__search-icon" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="catalogs__search"
              placeholder="Поиск по названию..."
              value={search}
              onChange={handleSearch}
            />
            {search && (
              <button className="catalogs__search-clear"
                onClick={() => { setSearch(''); setSearchVal(''); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Тип */}
          <div className="catalogs__filter-group">
            <div className="catalogs__filter-label">Тип</div>
            <div className="catalogs__filter-pills">
              {TYPE_ORDER.map((t) => (
                <button key={t}
                  className={`catalogs__pill catalogs__pill--type${filterTypes.includes(t) ? ' catalogs__pill--active' : ''}`}
                  onClick={() => toggle(filterTypes, setFilterTypes, t)}
                  title={TYPE_LABELS[t]}>
                  <TypeImg type={t} className="catalogs__pill-type-img" />
                </button>
              ))}
            </div>
          </div>

          {/* Уровень */}
          <div className="catalogs__filter-group">
            <div className="catalogs__filter-label">Уровень</div>
            <div className="catalogs__filter-pills">
              {TIERS.map((tier) => (
                <button key={tier}
                  className={`catalogs__pill catalogs__pill--tier${filterTiers.includes(tier) ? ' catalogs__pill--active' : ''}`}
                  onClick={() => toggle(filterTiers, setFilterTiers, tier)}>
                  {TIER_ROMAN[tier]}
                </button>
              ))}
            </div>
          </div>

          {/* Нации */}
          <div className="catalogs__filter-group catalogs__filter-group--full">
            <div className="catalogs__filter-label">Нация</div>
            <div className="catalogs__filter-pills catalogs__filter-pills--nations">
              {NATION_KEYS.map((n) => (
                <button key={n}
                  className={`catalogs__pill catalogs__pill--nation${filterNations.includes(n) ? ' catalogs__pill--active' : ''}`}
                  onClick={() => toggle(filterNations, setFilterNations, n)}
                  title={NATION_LABELS[n]}>
                  <NationImg nation={n} className="catalogs__pill-img" />
                  <span className="catalogs__pill-text">{NATION_LABELS[n]}</span>
                </button>
              ))}
            </div>
          </div>

          {hasFilters && (
            <button className="btn btn-ghost btn-sm catalogs__reset"
              onClick={() => { setFilterTypes([]); setFilterTiers([]); setFilterNations([]); setSearch(''); setSearchVal(''); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.5" />
              </svg>
              Сбросить
            </button>
          )}
        </div>

        {/* Counter */}
        <div className="catalogs__counter reveal">
          Показано <strong>{rows.length}</strong> из <strong>{vehicles.length}</strong> машин
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSpinner text="Загружаем список техники..." />
        ) : (
          <div className="catalog-table-wrap reveal">
            <table className="catalog-table">
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th key={col.key}
                      className={`catalog-table__th${col.sortable ? ' catalog-table__th--sortable' : ''}${sortCol === col.key ? ' catalog-table__th--sorted' : ''}`}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}>
                      <span className="catalog-table__th-inner">
                        {col.label}
                        {col.sortable && <SortIcon col={col.key} sortCol={sortCol} sortDir={sortDir} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={5} className="catalog-table__empty">Ничего не найдено</td></tr>
                ) : rows.map((v) => {
                  const hasDirectory = DIRECTORY_MAP.has(v.id);
                  return (
                    <tr key={v.id} className="catalog-table__row">
                      <td className="catalog-table__td catalog-table__td--nation">
                        <NationImg nation={v.nation} className="catalog-table__nation-img" />
                      </td>
                      <td className="catalog-table__td catalog-table__td--type">
                        <TypeImg type={v.type} className="catalog-table__type-img" />
                      </td>
                      <td className="catalog-table__td catalog-table__td--tier">
                        <span className="catalog-table__tier">{TIER_ROMAN[v.tier] ?? v.tier}</span>
                      </td>
                      <td className="catalog-table__td catalog-table__td--name">
                        {v.name}
                        {v.isPremium && <span className="catalog-table__tag catalog-table__tag--p">P</span>}
                        {v.isSpecial && <span className="catalog-table__tag catalog-table__tag--s">S</span>}
                        {v.isCollector && <span className="catalog-table__tag catalog-table__tag--c">C</span>}
                      </td>
                      <td className="catalog-table__td catalog-table__td--actions">
                        {hasDirectory ? (
                          <Link to={`/directory/${v.id}`}
                            className="btn btn-primary btn-sm catalog-table__build-btn">
                            Сборка
                          </Link>
                        ) : (
                          <span className="catalog-table__no-build">—</span>
                        )}
                      </td>
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

export default CatalogsTanks;