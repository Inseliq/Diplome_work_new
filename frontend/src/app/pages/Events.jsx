import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EVENTS_DATA, STATUS_CONFIG, CATEGORY_COLORS, CATEGORIES } from '../data/eventsData';

const PAGE_SIZE = 9;

function EventRow({ item }) {
  const st = STATUS_CONFIG[item.status];
  const cat = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Событие'];

  return (
    <Link to={`/events/${item.id}`} className={`event-row event-row--${item.status}`}>
      <div className="event-row__bar" style={{ background: st.color }} />

      <div className="event-row__thumb">
        {item.image
          ? <img src={item.image} alt={item.title} />
          : <div className="event-row__gradient" style={{ background: item.gradient }} />
        }
      </div>

      <div className="event-row__dates">
        <span className="event-row__status"
          style={{ color: st.color, background: st.bg, borderColor: st.border }}>
          <span className="event-row__status-dot" style={{ background: st.color }} />
          {st.label}
        </span>
        <time className="event-row__date-range">
          {item.dateStart}
          {item.dateEnd !== item.dateStart && <> — {item.dateEnd}</>}
        </time>
      </div>

      <div className="event-row__body">
        <span className="event-row__category"
          style={{ color: cat.color, borderColor: cat.border }}>
          {item.category}
        </span>
        <h3 className="event-row__title">{item.title}</h3>
        <p className="event-row__excerpt">{item.excerpt}</p>
      </div>

      <div className="event-row__arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
    </Link>
  );
}

function GroupSection({ label, color, items }) {
  if (!items.length) return null;
  return (
    <div className="events-list__group">
      <div className="events-list__group-title">
        <span className="events-list__group-dot" style={{ background: color }} />
        {label}
        <span className="events-list__group-count">{items.length}</span>
      </div>
      <div className="events-list__timeline">
        {items.map((item) => <EventRow key={item.id} item={item} />)}
      </div>
    </div>
  );
}

function ShowMore({ shown, total, onMore }) {
  return (
    <div className="events-list__more">
      <button className="btn btn-ghost btn-lg events-list__more-btn" onClick={onMore}>
        Показать ещё
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <span className="events-list__counter">Показано {shown} из {total}</span>
    </div>
  );
}

function Empty() {
  return <div className="events-list__empty">Нет событий в этой категории</div>;
}

// ─────────────────────────────────────────────────────────────

function Events() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Читаем начальные значения из URL (?status=active&category=Клан)
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'Все');
  const [endedVisible, setEndedVisible] = useState(PAGE_SIZE);

  // Синхронизируем URL при изменении фильтров
  useEffect(() => {
    const params = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    if (categoryFilter !== 'Все') params.category = categoryFilter;
    setSearchParams(params, { replace: true });
  }, [statusFilter, categoryFilter]);

  const handleStatus = (key) => {
    setStatusFilter(key);
    setEndedVisible(PAGE_SIZE);
  };

  const handleCategory = (cat) => {
    setCategoryFilter(cat);
    setEndedVisible(PAGE_SIZE);
  };

  // ── Базовая выборка с учётом фильтра категории ──
  const byCategory = (arr) =>
    categoryFilter === 'Все' ? arr : arr.filter((e) => e.category === categoryFilter);

  const ACTIVE_ALL = EVENTS_DATA
    .filter((e) => e.status === 'active')
    .sort((a, b) => new Date(b.dateStartISO) - new Date(a.dateStartISO));

  const SOON_ALL = EVENTS_DATA
    .filter((e) => e.status === 'soon')
    .sort((a, b) => new Date(a.dateStartISO) - new Date(b.dateStartISO));

  const ENDED_ALL = EVENTS_DATA
    .filter((e) => e.status === 'ended')
    .sort((a, b) => new Date(b.dateStartISO) - new Date(a.dateStartISO));

  const active = byCategory(ACTIVE_ALL);
  const soon = byCategory(SOON_ALL);
  const ended = byCategory(ENDED_ALL);

  const visibleEnded = ended.slice(0, endedVisible);
  const hasMoreEnded = endedVisible < ended.length;

  // Счётчики с учётом категории
  const counts = {
    all: byCategory(EVENTS_DATA).length,
    active: active.length,
    soon: soon.length,
    ended: ended.length,
  };

  const STATUS_FILTERS = [
    { key: 'all', label: 'Все', color: null },
    { key: 'active', label: 'Активные', color: '#22c55e' },
    { key: 'soon', label: 'Скоро', color: '#FAB81B' },
    { key: 'ended', label: 'Завершённые', color: '#888888' },
  ];

  const CAT_COLORS = {
    'Все': null,
    'Турнир': '#FF5000',
    'Событие': '#FAB81B',
    'Клан': '#835de4',
  };

  const renderContent = () => {
    switch (statusFilter) {
      case 'active':
        return active.length
          ? <div className="events-list__timeline">{active.map((i) => <EventRow key={i.id} item={i} />)}</div>
          : <Empty />;

      case 'soon':
        return soon.length
          ? <div className="events-list__timeline">{soon.map((i) => <EventRow key={i.id} item={i} />)}</div>
          : <Empty />;

      case 'ended':
        return ended.length ? (
          <>
            <div className="events-list__timeline">{visibleEnded.map((i) => <EventRow key={i.id} item={i} />)}</div>
            {hasMoreEnded && <ShowMore shown={visibleEnded.length} total={ended.length} onMore={() => setEndedVisible((v) => v + PAGE_SIZE)} />}
          </>
        ) : <Empty />;

      default: // all
        return (
          <>
            <GroupSection label="Активные" color="#22c55e" items={active} />
            <GroupSection label="Скоро" color="#FAB81B" items={soon} />

            {ended.length > 0 && (
              <div className="events-list__group">
                <div className="events-list__group-title">
                  <span className="events-list__group-dot" style={{ background: '#888888' }} />
                  Завершённые
                  <span className="events-list__group-count">{ended.length}</span>
                </div>
                <div className="events-list__timeline">
                  {visibleEnded.map((i) => <EventRow key={i.id} item={i} />)}
                </div>
                {hasMoreEnded && <ShowMore shown={visibleEnded.length} total={ended.length} onMore={() => setEndedVisible((v) => v + PAGE_SIZE)} />}
              </div>
            )}

            {!active.length && !soon.length && !ended.length && <Empty />}
          </>
        );
    }
  };

  return (
    <div className="wrapper events-list">
      <div className="container">

        <div className="events-list__header reveal">
          <div className="events-list__header-label">Календарь</div>
          <h1 className="events-list__title">События</h1>
          <p className="events-list__subtitle">
            Турниры, клановые события и игровые ивенты
          </p>
        </div>

        {/* ── Фильтр 1: по статусу ── */}
        <div className="events-list__filters reveal">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              className={`events-list__filter${statusFilter === f.key ? ' events-list__filter--active' : ''}`}
              onClick={() => handleStatus(f.key)}
              style={statusFilter === f.key && f.color ? { borderColor: f.color, color: f.color } : {}}
            >
              {f.label}
              <span className="events-list__filter-count">{counts[f.key]}</span>
            </button>
          ))}
        </div>

        {/* ── Фильтр 2: по категории ── */}
        <div className="events-list__filters events-list__filters--category reveal">
          {CATEGORIES.map((cat) => {
            const color = CAT_COLORS[cat];
            const isActive = categoryFilter === cat;
            return (
              <button
                key={cat}
                className={`events-list__filter events-list__filter--cat${isActive ? ' events-list__filter--active' : ''}`}
                onClick={() => handleCategory(cat)}
                style={isActive && color ? { borderColor: color, color } : {}}
              >
                {color && <span className="events-list__filter-dot" style={{ background: color }} />}
                {cat}
              </button>
            );
          })}
        </div>

        <div className="reveal">
          {renderContent()}
        </div>

      </div>
    </div>
  );
}

export default Events;