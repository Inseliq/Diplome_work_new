import React, { useState, useMemo, useEffect } from 'react';
import { useMarks } from '../hooks/useMarks';
import {
  NATION_LABELS,
  TYPE_SVG,
  NATION_KEYS
} from '../data/marksData';
import { LoadingSpinner, FallbackBanner } from '../components/ui/StatusComponents';

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

const TANK_PRIORITY_COLORS = [
  { key: 'is_premium', color: '#FFD700' },
  { key: 'is_special', color: '#00FFFF' },
  { key: 'is_collector', color: '#32CD32' },
  { key: 'default', color: '#FFFFFF' }
];

const TYPE_ORDER = ['heavyTank', 'mediumTank', 'lightTank', 'AT-SPG', 'SPG'];

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
  return <img src={icon.src} alt={icon.alt} className={className} onError={(e) => { e.target.style.opacity = '0.3'; }} />;
}

function Marks() {
  const { tanks, loading, isFallback } = useMarks();
  const [nations, setNations] = useState([]);
  const [types, setTypes] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [sortCol, setSortCol] = useState('moe_100');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    const savedFilters = JSON.parse(localStorage.getItem('marksFilters') || '{}');
    if (savedFilters.nations) setNations(savedFilters.nations);
    if (savedFilters.types) setTypes(savedFilters.types);
    if (savedFilters.tiers) setTiers(savedFilters.tiers);
  }, []);

  useEffect(() => {
    localStorage.setItem('marksFilters', JSON.stringify({ nations, types, tiers }));
  }, [nations, types, tiers]);

  const toggle = (arr, setArr, val) => setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const rows = useMemo(() => {
    let list = [...tanks];
    if (nations.length) list = list.filter(t => nations.includes(t.nation));
    if (types.length) list = list.filter(t => types.includes(t.type));
    if (tiers.length) list = list.filter(t => tiers.includes(t.tier));

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

    list.sort((a, b) => {
      const getPriority = t => {
        for (const p of TANK_PRIORITY_COLORS) if (p.key !== 'default' && t[p.key]) return p.key;
        return 'default';
      };
      return ['is_premium', 'is_special', 'is_collector', 'default'].indexOf(getPriority(a)) -
        ['is_premium', 'is_special', 'is_collector', 'default'].indexOf(getPriority(b));
    });

    return list;
  }, [tanks, nations, types, tiers, sortCol, sortDir]);

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

  return (
    <div className="wrapper marks">
      <div className="container">
        <div className="marks__header reveal">
          <div className="marks__header-label">Достижения</div>
          <h1 className="marks__title">Отметки на стволах</h1>
          <p className="marks__subtitle">Сколько среднего урона нужно нанести для получения отметки</p>
        </div>

        {isFallback && <FallbackBanner />}

        <div className="marks__filters reveal">
          <div className="marks__filter-groups">
            <div className="marks__filter-group">
              <div className="marks__filter-label">Нация</div>
              <div className="marks__filter-pills marks__filter-pills--nations">
                {NATION_KEYS.map(n => (
                  <button
                    key={n}
                    className={`marks__pill marks__pill--nation${nations.includes(n) ? ' marks__pill--active' : ''}`}
                    onClick={() => toggle(nations, setNations, n)}
                    title={NATION_LABELS[n]}
                  >
                    <NationImg nation={n} className="marks__pill-img" />
                    <span className="marks__pill-text">{NATION_LABELS[n]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="marks__filter-row">
              <div className="marks__filter-group">
                <div className="marks__filter-label">Тип</div>
                <div className="marks__filter-pills">
                  {TYPE_ORDER.map(t => (
                    <button
                      key={t}
                      className={`marks__pill marks__pill--type${types.includes(t) ? ' marks__pill--active' : ''}`}
                      onClick={() => toggle(types, setTypes, t)}
                    >
                      <img src={TYPE_SVG[t]} alt={t} width="24" height="24" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="marks__filter-group">
                <div className="marks__filter-label">Уровень</div>
                <div className="marks__filter-pills">
                  {[5, 6, 7, 8, 9, 10, 11].map(tier => (
                    <button
                      key={tier}
                      className={`marks__pill marks__pill--tier${tiers.includes(tier) ? ' marks__pill--active' : ''}`}
                      onClick={() => toggle(tiers, setTiers, tier)}
                    >
                      {['V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'][tier - 5]}
                    </button>
                  ))}
                </div>
              </div>

              {!!(nations.length || types.length || tiers.length) && (
                <button className="btn btn-ghost btn-sm marks__reset" onClick={() => { setNations([]); setTypes([]); setTiers([]); }}>
                  Сбросить
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="marks__counter reveal">
          Показано <strong>{rows.length}</strong> из <strong>{tanks.length}</strong> машин
        </div>

        {loading ? <LoadingSpinner text="Загружаем данные отметок..." /> : (
          <div className="marks__table-wrap reveal">
            <table className="marks-table">
              <thead>
                <tr>
                  {COLUMNS.map(col => (
                    <th key={col.key}
                      className={`marks-table__th${col.sortable ? ' marks-table__th--sortable' : ''}${sortCol === col.key ? ' marks-table__th--sorted' : ''}`}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    >
                      <span className="marks-table__th-inner">
                        {col.label}
                        {col.sortable && <SortIcon col={col.key} sortCol={sortCol} sortDir={sortDir} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={8}>Ничего не найдено. Измените фильтры.</td></tr>
                ) : rows.map(tank => {
                  const colorObj = TANK_PRIORITY_COLORS.find(p => p.key !== 'default' && tank[p.key]) || TANK_PRIORITY_COLORS.find(p => p.key === 'default');
                  return (
                    <tr key={tank.tank_id} className='marks-table__tr'>
                      <td className='marks-table__td marks-table__td--nation'><NationImg nation={tank.nation} className="marks-table__nation-img" /></td>
                      <td className='marks-table__td marks-table__td--type'><img src={TYPE_SVG[tank.type]} alt={tank.type} className='marks-table__type-img' /></td>
                      <td className='marks-table__td'>{['V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'][tank.tier - 5]}</td>
                      <td className='marks-table__td' style={{ color: colorObj.color }}>{tank.name}</td>
                      <td className='marks-table__td'>{fmt(tank.moe_65)}</td>
                      <td className='marks-table__td'>{fmt(tank.moe_85)}</td>
                      <td className='marks-table__td'>{fmt(tank.moe_95)}</td>
                      <td className='marks-table__td'>{fmt(tank.moe_100)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Marks;