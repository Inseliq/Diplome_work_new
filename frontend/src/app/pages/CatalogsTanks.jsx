import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { LoadingSpinner } from '../components/ui/StatusComponents';

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

const TYPE_LABELS = {
  heavyTank: 'ТТ',
  mediumTank: 'СТ',
  lightTank: 'ЛТ',
  'AT-SPG': 'ПТ',
  SPG: 'САУ',
};

const TYPE_KEYS = ['heavyTank', 'mediumTank', 'lightTank', 'AT-SPG', 'SPG'];

const TYPE_ICONS = {
  heavyTank: { src: '/images/types/heavy_tank.svg', alt: 'ТТ' },
  mediumTank: { src: '/images/types/medium_tank.svg', alt: 'СТ' },
  lightTank: { src: '/images/types/light_tank.svg', alt: 'ЛТ' },
  'AT-SPG': { src: '/images/types/at_spg.svg', alt: 'ПТ' },
  SPG: { src: '/images/types/spg.svg', alt: 'САУ' },
};

const TIERS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const TIER_ROMAN = {
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

const VEHICLE_KIND_LABELS = {
  premium: 'Премиум',
  default: 'Обычные',
  special: 'Специальные',
  collector: 'Коллекционные',
};

const VEHICLE_KIND_KEYS = Object.keys(VEHICLE_KIND_LABELS);

// ─── Helpers ────────────────────────────────────────────────────

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

function TypeImg({ type, className }) {
  const icon = TYPE_ICONS[type];

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

function VehicleViewImg({ vehicle }) {
  const internalName = vehicle.internalName || vehicle.internal_name;

  if (!internalName) return null;

  const src = vehicle.iconUrl || `https://cdn.poliroid.me/icons/tanks_svg/ru/${internalName}.svg`;

  return (
    <img
      src={src}
      alt={vehicle.name}
      className="catalog-table__vehicle-view-img"
      onError={(e) => {
        e.target.style.display = 'none';
      }}
    />
  );
}

function SortIcon({ col, sortCol, sortDir }) {
  const active = sortCol === col;

  return (
    <span className={`catalog-table__sort-icon${active ? ' catalog-table__sort-icon--active' : ''}`}>
      {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );
}

function getVehicleKind(vehicle) {
  if (vehicle.isPremium) return 'premium';
  if (vehicle.isSpecial) return 'special';
  if (vehicle.isCollector) return 'collector';

  return 'default';
}

function getNameGroup(name) {
  const first = String(name || '').trim().charAt(0);

  if (!first) return 0;

  // Сначала любые символы
  if (!/[\p{L}\p{N}]/u.test(first)) return 0;

  // Потом цифры
  if (/\p{N}/u.test(first)) return 1;

  // Потом латиница
  if (/\p{Script=Latin}/u.test(first)) return 2;

  // Потом кириллица
  if (/\p{Script=Cyrillic}/u.test(first)) return 3;

  return 4;
}

function compareVehicleNames(a, b) {
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

  return compareVehicleNames(a, b);
}

function compareTypes(a, b) {
  const typeA = TYPE_KEYS.indexOf(a.type);
  const typeB = TYPE_KEYS.indexOf(b.type);

  const normalizedA = typeA === -1 ? 999 : typeA;
  const normalizedB = typeB === -1 ? 999 : typeB;

  if (normalizedA !== normalizedB) {
    return normalizedA - normalizedB;
  }

  return compareVehicleNames(a, b);
}

function compareValues(a, b, sortCol) {
  if (sortCol === 'name') {
    return compareVehicleNames(a, b);
  }

  if (sortCol === 'nation') {
    return compareNations(a, b);
  }

  if (sortCol === 'type') {
    return compareTypes(a, b);
  }

  const va = a[sortCol];
  const vb = b[sortCol];

  if (va == null && vb == null) return compareVehicleNames(a, b);
  if (va == null) return -1;
  if (vb == null) return 1;

  if (typeof va === 'string') {
    const diff = va.localeCompare(vb, ['en', 'ru'], {
      numeric: true,
      sensitivity: 'base',
    });

    return diff !== 0 ? diff : compareVehicleNames(a, b);
  }

  const diff = va - vb;

  return diff !== 0 ? diff : compareVehicleNames(a, b);
}

// ─── Component ──────────────────────────────────────────────────

function CatalogsTanks() {
  const {
    vehicles = [],
    loading,
    error,
    reload,
  } = useVehicles();

  const [filterTypes, setFilterTypes] = useState([]);
  const [filterTiers, setFilterTiers] = useState([]);
  const [filterNations, setFilterNations] = useState([]);
  const [vehicleKinds, setVehicleKinds] = useState(VEHICLE_KIND_KEYS);

  const [search, setSearch] = useState('');
  const [searchVal, setSearchVal] = useState('');

  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const [isTableRevealed, setIsTableRevealed] = useState(false);

  const searchTimer = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('catalogFilters') || '{}');

    if (saved.filterTypes) setFilterTypes(saved.filterTypes);
    if (saved.filterTiers) setFilterTiers(saved.filterTiers);
    if (saved.filterNations) setFilterNations(saved.filterNations);
    if (saved.vehicleKinds?.length) setVehicleKinds(saved.vehicleKinds);
    if (saved.search) {
      setSearch(saved.search);
      setSearchVal(saved.search.toLowerCase().trim());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('catalogFilters', JSON.stringify({
      filterTypes,
      filterTiers,
      filterNations,
      vehicleKinds,
      search,
    }));
  }, [filterTypes, filterTiers, filterNations, vehicleKinds, search]);

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
      setSearchVal(value.toLowerCase().trim());
    }, 300);
  };

  const toggle = (arr, setArr, val) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const toggleVehicleKind = (kind) => {
    setVehicleKinds((prev) => {
      if (prev.includes(kind)) {
        const next = prev.filter((x) => x !== kind);

        // Не даём выключить все категории
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

    if (col === 'tier') {
      setSortDir('desc');
      return;
    }

    setSortDir('asc');
  };

  const rows = useMemo(() => {
    let list = [...vehicles];

    if (filterTypes.length) {
      list = list.filter((vehicle) => filterTypes.includes(vehicle.type));
    }

    if (filterTiers.length) {
      list = list.filter((vehicle) => filterTiers.includes(vehicle.tier));
    }

    if (filterNations.length) {
      list = list.filter((vehicle) => filterNations.includes(vehicle.nation));
    }

    if (vehicleKinds.length !== VEHICLE_KIND_KEYS.length) {
      list = list.filter((vehicle) => vehicleKinds.includes(getVehicleKind(vehicle)));
    }

    if (searchVal) {
      list = list.filter((vehicle) => {
        const name = vehicle.name?.toLowerCase() || '';
        const shortName = vehicle.shortName?.toLowerCase() || '';
        const internalName = vehicle.internalName?.toLowerCase() || '';

        return (
          name.includes(searchVal) ||
          shortName.includes(searchVal) ||
          internalName.includes(searchVal)
        );
      });
    }

    list.sort((a, b) => {
      const diff = compareValues(a, b, sortCol);

      return sortDir === 'asc' ? diff : -diff;
    });

    return list;
  }, [
    vehicles,
    filterTypes,
    filterTiers,
    filterNations,
    vehicleKinds,
    searchVal,
    sortCol,
    sortDir,
  ]);

  const hasFilters = Boolean(
    filterTypes.length ||
    filterTiers.length ||
    filterNations.length ||
    vehicleKinds.length !== VEHICLE_KIND_KEYS.length ||
    search
  );

  const COLUMNS = [
    { key: 'nation', label: 'Нация', sortable: true },
    { key: 'type', label: 'Тип', sortable: true },
    { key: 'tier', label: 'Ур.', sortable: true },
    { key: 'view', label: 'Вид', sortable: false },
    { key: 'name', label: 'Танк', sortable: true },
    { key: 'actions', label: '', sortable: false },
  ];

  return (
    <div className="wrapper catalogs">
      <div className="container">
        <div className="catalogs__header reveal">
          <div className="catalogs__header-label">Техника</div>
          <h1 className="catalogs__title">Каталог танков</h1>
          <p className="catalogs__subtitle">
            Сборки оборудования и полевые модернизации для техники
          </p>
        </div>

        {error && !loading && (
          <div className="catalog-table-wrap reveal reveal--visible" style={{ padding: '32px', textAlign: 'center' }}>
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
            <div className="catalogs__filters reveal">
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
                  placeholder="Поиск по названию..."
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

              <div className="catalogs__filter-group">
                <div className="catalogs__filter-label">Тип</div>
                <div className="catalogs__filter-pills">
                  {TYPE_KEYS.map((type) => (
                    <button
                      key={type}
                      className={`catalogs__pill catalogs__pill--type${filterTypes.includes(type) ? ' catalogs__pill--active' : ''}`}
                      onClick={() => toggle(filterTypes, setFilterTypes, type)}
                      title={TYPE_LABELS[type]}
                    >
                      <TypeImg type={type} className="catalogs__pill-type-img" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="catalogs__filter-group">
                <div className="catalogs__filter-label">Уровень</div>
                <div className="catalogs__filter-pills">
                  {TIERS.map((tier) => (
                    <button
                      key={tier}
                      className={`catalogs__pill catalogs__pill--tier${filterTiers.includes(tier) ? ' catalogs__pill--active' : ''}`}
                      onClick={() => toggle(filterTiers, setFilterTiers, tier)}
                    >
                      {TIER_ROMAN[tier]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="catalogs__filter-group">
                <div className="catalogs__filter-label">Категория</div>
                <div className="catalogs__filter-pills">
                  {VEHICLE_KIND_KEYS.map((kind) => (
                    <button
                      key={kind}
                      className={`catalogs__pill catalogs__pill--kind${vehicleKinds.includes(kind) ? ' catalogs__pill--active' : ''}`}
                      onClick={() => toggleVehicleKind(kind)}
                    >
                      {VEHICLE_KIND_LABELS[kind]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="catalogs__filter-group catalogs__filter-group--full">
                <div className="catalogs__filter-label">Нация</div>
                <div className="catalogs__filter-pills catalogs__filter-pills--nations">
                  {NATION_KEYS.map((nation) => (
                    <button
                      key={nation}
                      className={`catalogs__pill catalogs__pill--nation${filterNations.includes(nation) ? ' catalogs__pill--active' : ''}`}
                      onClick={() => toggle(filterNations, setFilterNations, nation)}
                      title={NATION_LABELS[nation]}
                    >
                      <NationImg nation={nation} className="catalogs__pill-img" />
                      <span className="catalogs__pill-text">{NATION_LABELS[nation]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {hasFilters && (
                <button
                  className="btn btn-ghost btn-sm catalogs__reset"
                  onClick={() => {
                    setFilterTypes([]);
                    setFilterTiers([]);
                    setFilterNations([]);
                    setVehicleKinds(VEHICLE_KIND_KEYS);
                    setSearch('');
                    setSearchVal('');
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
                  </svg>
                  Сбросить
                </button>
              )}
            </div>

            <div className="catalogs__counter reveal">
              Показано <strong>{rows.length}</strong> из <strong>{vehicles.length}</strong> машин
            </div>

            {loading ? (
              <LoadingSpinner text="Загружаем список техники..." />
            ) : (
              <div className={`catalog-table-wrap reveal${isTableRevealed ? ' reveal--visible' : ''}`}>
                <table className="catalog-table">
                  <thead>
                    <tr>
                      {COLUMNS.map((col) => (
                        <th
                          key={col.key}
                          className={`catalog-table__th${col.sortable ? ' catalog-table__th--sortable' : ''}${sortCol === col.key ? ' catalog-table__th--sorted' : ''}`}
                          onClick={col.sortable ? () => handleSort(col.key) : undefined}
                        >
                          <span className="catalog-table__th-inner">
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
                          <td colSpan={6} className="catalog-table__empty">
                          Ничего не найдено
                        </td>
                      </tr>
                    ) : rows.map((vehicle) => (
                      <tr key={vehicle.id} className="catalog-table__row">
                        <td className="catalog-table__td catalog-table__td--nation">
                          <NationImg nation={vehicle.nation} className="catalog-table__nation-img" />
                        </td>

                        <td className="catalog-table__td catalog-table__td--type">
                          <TypeImg type={vehicle.type} className="catalog-table__type-img" />
                        </td>

                        <td className="catalog-table__td catalog-table__td--tier">
                          <span className="catalog-table__tier">
                            {TIER_ROMAN[vehicle.tier] ?? vehicle.tier}
                          </span>
                        </td>

                        <td className="catalog-table__td catalog-table__td--view">
                          <VehicleViewImg vehicle={vehicle} />
                        </td>

                        <td className="catalog-table__td catalog-table__td--name">
                          {vehicle.name}

                          {vehicle.isPremium && (
                            <span className="catalog-table__tag catalog-table__tag--p">
                              P
                            </span>
                          )}

                          {vehicle.isSpecial && (
                            <span className="catalog-table__tag catalog-table__tag--s">
                              S
                            </span>
                          )}

                          {vehicle.isCollector && (
                            <span className="catalog-table__tag catalog-table__tag--c">
                              C
                            </span>
                          )}
                        </td>

                        <td className="catalog-table__td catalog-table__td--actions">
                          {vehicle.hasDirectory ? (
                            <Link
                              to={`/directory/${vehicle.id}`}
                              className="btn btn-primary btn-sm catalog-table__build-btn"
                            >
                              Сборка
                            </Link>
                          ) : (
                            <span className="catalog-table__no-build">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
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

export default CatalogsTanks;