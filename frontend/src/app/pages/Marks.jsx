import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMarks } from '../hooks/useMarks';
import {
  NATION_LABELS,
  TYPE_SVG,
  NATION_KEYS,
  TYPE_KEYS,
  TIER_LABELS,
  VEHICLE_KIND_LABELS,
  VEHICLE_KIND_KEYS
} from '../data/marksData';
import { LoadingSpinner } from '../components/ui/StatusComponents';

const NATION_ICONS = {
  ussr: { src: '/images/nations/ussr.png', alt: 'СССР' },
  germany: { src: '/images/nations/germany.png', alt: 'Германия' },
  usa: { src: '/images/nations/usa.png', alt: 'США' },
  china: { src: '/images/nations/china.png', alt: 'Китай' },
  france: { src: '/images/nations/france.png', alt: 'Франция' },
  uk: { src: '/images/nations/uk.png', alt: 'Великобритания' },
  japan: { src: '/images/nations/japan.png', alt: 'Япония' },
  czech: { src: '/images/nations/czech.png', alt: 'Чехословакия' },
  sweden: { src: '/images/nations/sweden.png', alt: 'Швеция' },
  poland: { src: '/images/nations/poland.png', alt: 'Польша' },
  italy: { src: '/images/nations/italy.png', alt: 'Италия' },
  intunion: { src: '/images/nations/intunion.png', alt: 'Сборная нация' },
};

const TANK_PRIORITY_COLORS = [
  { key: 'is_premium', color: '#FFD700' },
  { key: 'is_special', color: '#00FFFF' },
  { key: 'is_collector', color: '#32CD32' },
  { key: 'default', color: '#FFFFFF' }
];

function fmt(val) {
  if (val == null) return <span className="marks-table__null">—</span>;

  return val.toLocaleString('ru-RU');
}

function SortIcon({ col, sortCol, sortDir }) {
  const active = sortCol === col;

  return (
    <span className={`marks-table__sort-icon${active ? ' marks-table__sort-icon--active' : ''}`}>
      {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );
}

function NationImg({ nation, className }) {
  const icon = NATION_ICONS[nation];

  if (!icon) return null;

  return (
    <img
      src={icon.src}
      alt={icon.alt}
      className={className}
      onError={(e) => {
        e.target.style.opacity = '0.3';
      }}
    />
  );
}

function getVehicleKind(tank) {
  if (tank.is_premium) return 'premium';
  if (tank.is_special) return 'special';
  if (tank.is_collector) return 'collector';

  return 'default';
}

function getNameGroup(name) {
  const first = String(name || '').trim().charAt(0);

  if (!first) return 0;

  if (!/[\p{L}\p{N}]/u.test(first)) return 0;
  if (/\p{N}/u.test(first)) return 1;
  if (/\p{Script=Latin}/u.test(first)) return 2;
  if (/\p{Script=Cyrillic}/u.test(first)) return 3;

  return 4;
}

function compareTankNames(a, b) {
  const nameA = a.name || '';
  const nameB = b.name || '';

  const groupA = getNameGroup(nameA);
  const groupB = getNameGroup(nameB);

  if (groupA !== groupB) {
    return groupA - groupB;
  }

  return nameA.localeCompare(nameB, ['en', 'ru'], {
    numeric: true,
    sensitivity: 'base',
  });
}

function compareNations(a, b) {
  const nationA = NATION_KEYS.indexOf(a.nation);
  const nationB = NATION_KEYS.indexOf(b.nation);

  const normalizedA = nationA === -1 ? 999 : nationA;
  const normalizedB = nationB === -1 ? 999 : nationB;

  if (normalizedA !== normalizedB) {
    return normalizedA - normalizedB;
  }

  return compareTankNames(a, b);
}

function normalizeSearchText(value) {
  return String(value ?? '').toLowerCase().trim();
}

function matchesTankSearch(tank, query) {
  if (!query) return true;

  return [
    tank.name,
    tank.short_name,
    tank.shortName,
    tank.internal_name,
    tank.internalName,
    tank.tank_id,
    tank.id,
  ].some((value) => normalizeSearchText(value).includes(query));
}

function compareValues(a, b, sortCol) {
  if (sortCol === 'name') {
    return compareTankNames(a, b);
  }

  if (sortCol === 'nation') {
    return compareNations(a, b);
  }

  if (sortCol === 'type') {
    const typeA = TYPE_KEYS.indexOf(a.type);
    const typeB = TYPE_KEYS.indexOf(b.type);

    const normalizedA = typeA === -1 ? 999 : typeA;
    const normalizedB = typeB === -1 ? 999 : typeB;

    if (normalizedA !== normalizedB) {
      return normalizedA - normalizedB;
    }

    return compareTankNames(a, b);
  }

  const va = a[sortCol];
  const vb = b[sortCol];

  if (va == null && vb == null) return compareTankNames(a, b);
  if (va == null) return -1;
  if (vb == null) return 1;

  if (typeof va === 'string') {
    const diff = va.localeCompare(vb, ['en', 'ru'], {
      numeric: true,
      sensitivity: 'base',
    });

    return diff !== 0 ? diff : compareTankNames(a, b);
  }

  const diff = va - vb;

  return diff !== 0 ? diff : compareTankNames(a, b);
}

function Marks() {
  const {
    tanks = [],
    updatedAt,
    loading,
    error,
    reload
  } = useMarks();

  const [nations, setNations] = useState([]);
  const [types, setTypes] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [vehicleKinds, setVehicleKinds] = useState(VEHICLE_KIND_KEYS);
  const [search, setSearch] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [sortCol, setSortCol] = useState('moe_100');
  const [sortDir, setSortDir] = useState('desc');
  const [isTableRevealed, setIsTableRevealed] = useState(false);

  const searchTimer = useRef(null);

  useEffect(() => {
    const savedFilters = JSON.parse(localStorage.getItem('marksFilters') || '{}');

    if (savedFilters.nations) setNations(savedFilters.nations);
    if (savedFilters.types) setTypes(savedFilters.types);
    if (savedFilters.tiers) setTiers(savedFilters.tiers);
    if (savedFilters.vehicleKinds?.length) setVehicleKinds(savedFilters.vehicleKinds);

    if (savedFilters.search) {
      setSearch(savedFilters.search);
      setSearchVal(normalizeSearchText(savedFilters.search));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('marksFilters', JSON.stringify({
      nations,
      types,
      tiers,
      vehicleKinds,
      search,
    }));
  }, [nations, types, tiers, vehicleKinds, search]);

  useEffect(() => {
    return () => {
      clearTimeout(searchTimer.current);
    };
  }, []);

  useEffect(() => {
    if (loading || error) {
      setIsTableRevealed(false);
      return;
    }

    let frame1;
    let frame2;

    setIsTableRevealed(false);

    frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        setIsTableRevealed(true);
      });
    });

    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, [loading, error]);

  const handleSearch = (event) => {
    const value = event.target.value;

    setSearch(value);

    clearTimeout(searchTimer.current);

    searchTimer.current = setTimeout(() => {
      setSearchVal(normalizeSearchText(value));
    }, 300);
  };

  const toggle = (arr, setArr, val) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const toggleVehicleKind = (kind) => {
    setVehicleKinds((prev) => {
      if (prev.includes(kind)) {
        const next = prev.filter((x) => x !== kind);

        return next.length ? next : prev;
      }

      return [...prev, kind];
    });
  };

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir((direction) => direction === 'asc' ? 'desc' : 'asc');
      return;
    }

    setSortCol(col);

    if (col === 'tier' || col.startsWith('moe_')) {
      setSortDir('desc');
      return;
    }

    setSortDir('asc');
  };

  const rows = useMemo(() => {
    let list = [...tanks];

    if (nations.length) {
      list = list.filter((tank) => nations.includes(tank.nation));
    }

    if (types.length) {
      list = list.filter((tank) => types.includes(tank.type));
    }

    if (tiers.length) {
      list = list.filter((tank) => tiers.includes(tank.tier));
    }

    if (vehicleKinds.length !== VEHICLE_KIND_KEYS.length) {
      list = list.filter((tank) => vehicleKinds.includes(getVehicleKind(tank)));
    }

    if (searchVal) {
      list = list.filter((tank) => matchesTankSearch(tank, searchVal));
    }

    list.sort((a, b) => {
      const diff = compareValues(a, b, sortCol);

      return sortDir === 'asc' ? diff : -diff;
    });

    return list;
  }, [tanks, nations, types, tiers, vehicleKinds, searchVal, sortCol, sortDir]);

  const hasFilters = Boolean(
    nations.length ||
    types.length ||
    tiers.length ||
    vehicleKinds.length !== VEHICLE_KIND_KEYS.length ||
    search
  );

  const COLUMNS = [
    { key: 'nation', label: 'Нация', sortable: true },
    { key: 'type', label: 'Тип', sortable: true },
    { key: 'tier', label: 'Уровень', sortable: true },
    { key: 'name', label: 'Танк', sortable: true },
    { key: 'moe_65', label: '65%', sortable: true },
    { key: 'moe_85', label: '85%', sortable: true },
    { key: 'moe_95', label: '95%', sortable: true },
    { key: 'moe_100', label: '100%', sortable: true },
  ];

  const formattedUpdatedAt = updatedAt
    ? new Date(updatedAt).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : null;

  return (
    <div className="wrapper marks">
      <div className="container">
        <div className="marks__header reveal">
          <div className="marks__header-label">Достижения</div>
          <h1 className="marks__title">Отметки на стволах</h1>
          <p className="marks__subtitle">
            Сколько среднего урона нужно нанести для получения отметки
          </p>
        </div>

        {formattedUpdatedAt && (
          <div className="marks__counter reveal">
            Последнее обновление данных: <strong>{formattedUpdatedAt}</strong>
          </div>
        )}

        {error && !loading && (
          <div className="marks__table-wrap reveal reveal--visible" style={{ padding: '32px', textAlign: 'center' }}>
            <h2>К сожалению не удалось загрузить данные с сервера.</h2>
            <p>Пожалуйста попробуйте перезагрузить.</p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={reload}>
                Попробовать снова
              </button>

              <Link className="btn btn-ghost" to="/">
                На главную
              </Link>
            </div>
          </div>
        )}

        {!error && (
          <>
            <div className="marks__filters reveal">
              <div className="catalogs__search-wrap">
                <svg
                  className="catalogs__search-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>

                <input
                  type="text"
                  className="catalogs__search"
                  placeholder="Поиск по названию техники..."
                  value={search}
                  onChange={handleSearch}
                />

                {search && (
                  <button
                    className="catalogs__search-clear"
                    onClick={() => {
                      setSearch('');
                      setSearchVal('');
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="marks__filter-groups">
                <div className="marks__filter-group">
                  <div className="marks__filter-label">Нация</div>

                  <div className="marks__filter-pills marks__filter-pills--nations">
                    {NATION_KEYS.map((nation) => (
                      <button
                        key={nation}
                        className={`marks__pill marks__pill--nation${nations.includes(nation) ? ' marks__pill--active' : ''}`}
                        onClick={() => toggle(nations, setNations, nation)}
                        title={NATION_LABELS[nation]}
                      >
                        <NationImg nation={nation} className="marks__pill-img" />
                        <span className="marks__pill-text">{NATION_LABELS[nation]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="marks__filter-row">
                  <div className="marks__filter-group">
                    <div className="marks__filter-label">Тип</div>

                    <div className="marks__filter-pills">
                      {TYPE_KEYS.map((type) => (
                        <button
                          key={type}
                          className={`marks__pill marks__pill--type${types.includes(type) ? ' marks__pill--active' : ''}`}
                          onClick={() => toggle(types, setTypes, type)}
                        >
                          <img src={TYPE_SVG[type]} alt={type} width="24" height="24" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="marks__filter-group">
                    <div className="marks__filter-label">Уровень</div>

                    <div className="marks__filter-pills">
                      {TIER_LABELS.map((label, index) => {
                        const tier = index + 5;

                        return (
                          <button
                            key={tier}
                            className={`marks__pill marks__pill--tier${tiers.includes(tier) ? ' marks__pill--active' : ''}`}
                            onClick={() => toggle(tiers, setTiers, tier)}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="marks__filter-group">
                    <div className="marks__filter-label">Категория</div>

                    <div className="marks__filter-pills">
                      {VEHICLE_KIND_KEYS.map((kind) => (
                        <button
                          key={kind}
                          className={`marks__pill marks__pill--kind${vehicleKinds.includes(kind) ? ' marks__pill--active' : ''}`}
                          onClick={() => toggleVehicleKind(kind)}
                        >
                          {VEHICLE_KIND_LABELS[kind]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {hasFilters && (
                    <button
                      className="btn btn-ghost btn-sm marks__reset"
                      onClick={() => {
                        setNations([]);
                        setTypes([]);
                        setTiers([]);
                        setVehicleKinds(VEHICLE_KIND_KEYS);
                        setSearch('');
                        setSearchVal('');
                      }}
                    >
                      Сбросить
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="marks__counter reveal">
              Показано <strong>{rows.length}</strong> из <strong>{tanks.length}</strong> машин
            </div>

            {loading ? (
              <LoadingSpinner text="Загружаем данные отметок..." />
            ) : (
              <div className={`marks__table-wrap reveal${isTableRevealed ? ' reveal--visible' : ''}`}>
                <table className="marks-table">
                  <thead>
                    <tr>
                      {COLUMNS.map((col) => (
                        <th
                          key={col.key}
                          className={`marks-table__th${col.sortable ? ' marks-table__th--sortable' : ''}${sortCol === col.key ? ' marks-table__th--sorted' : ''}`}
                          onClick={col.sortable ? () => handleSort(col.key) : undefined}
                        >
                          <span className="marks-table__th-inner">
                            {col.label}
                            {col.sortable && (
                              <SortIcon
                                col={col.key}
                                sortCol={sortCol}
                                sortDir={sortDir}
                              />
                            )}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="marks-table__empty">
                          Ничего не найдено. Измените фильтры.
                        </td>
                      </tr>
                    ) : rows.map((tank) => {
                      const colorObj =
                        TANK_PRIORITY_COLORS.find((priority) => priority.key !== 'default' && tank[priority.key]) ||
                        TANK_PRIORITY_COLORS.find((priority) => priority.key === 'default');

                      return (
                        <tr key={tank.tank_id} className="marks-table__row">
                          <td className="marks-table__td marks-table__td--nation">
                            <NationImg nation={tank.nation} className="marks-table__nation-img" />
                          </td>

                          <td className="marks-table__td marks-table__td--type">
                            <img
                              src={TYPE_SVG[tank.type]}
                              alt={tank.type}
                              className="marks-table__type-img"
                            />
                          </td>

                          <td className="marks-table__td marks-table__tier">
                            {TIER_LABELS[tank.tier - 5]}
                          </td>

                          <td className="marks-table__td" style={{ color: colorObj?.color }}>
                            {tank.name}
                          </td>

                          <td className="marks-table__td">{fmt(tank.moe_65)}</td>
                          <td className="marks-table__td">{fmt(tank.moe_85)}</td>
                          <td className="marks-table__td">{fmt(tank.moe_95)}</td>
                          <td className="marks-table__td">{fmt(tank.moe_100)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Marks;