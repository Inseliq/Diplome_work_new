import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useEventDetail } from '../hooks/useEventDetail';
import { useEvents } from '../hooks/useEvents';
import { STATUS_CONFIG, CATEGORY_COLORS } from '../data/eventsData';
import { parseMarkup } from '../utils/parseMarkup';
import { LoadingSpinner } from '../components/ui/StatusComponents';

function EventDetail() {
  const { id } = useParams();
  const { event: item, loading } = useEventDetail(id);
  const { events: allEvents } = useEvents();

  if (loading) {
    return (
      <div className="wrapper event-detail">
        <div className="container">
          <LoadingSpinner text="Загружаем событие..." />
        </div>
      </div>
    );
  }

  if (!loading && !item) return <Navigate to="/events" replace />;

  const st = STATUS_CONFIG[item.status];
  const cat = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Событие'];

  const related = [...allEvents]
    .sort((a, b) => new Date(b.dateStartISO) - new Date(a.dateStartISO))
    .filter((e) => e.id !== item.id)
    .slice(0, 3);

  return (
    <div className="wrapper event-detail">
      <div className="container">

        <nav className="event-detail__breadcrumb reveal">
          <Link to="/" className="event-detail__crumb">Главная</Link>
          <span className="event-detail__crumb-sep">/</span>
          <Link to="/events" className="event-detail__crumb">События</Link>
          <span className="event-detail__crumb-sep">/</span>
          <span className="event-detail__crumb event-detail__crumb--active">{item.title}</span>
        </nav>

        <div className="event-detail__layout">
          <article className="event-detail__article reveal">
            <div className="event-detail__hero">
              {item.image
                ? <img src={item.image} alt={item.title} className="event-detail__hero-img" />
                : <div className="event-detail__hero-gradient" style={{ background: item.gradient }} />
              }
              <div className="event-detail__hero-overlay" />
            </div>

            <div className="event-detail__infobar">
              <span className="event-detail__status"
                style={{ color: st.color, background: st.bg, borderColor: st.border }}>
                <span className="event-detail__status-dot" style={{ background: st.color }} />
                {st.label}
              </span>
              <span className="event-detail__category"
                style={{ color: cat.color, borderColor: cat.border }}>
                {item.category}
              </span>
              <div className="event-detail__dates">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <time>{item.dateStart}</time>
                {item.dateEnd !== item.dateStart && (
                  <><span className="event-detail__dates-sep">—</span><time>{item.dateEnd}</time></>
                )}
              </div>
            </div>

            <h1 className="event-detail__title">{item.title}</h1>
            <p className="event-detail__excerpt">{item.excerpt}</p>
            <div className="event-detail__divider" />

            <div className="event-detail__content markup">
              {item.content
                ? parseMarkup(item.content)
                : <p className="markup-p" style={{ color: 'var(--text-dim)' }}>Содержимое недоступно.</p>
              }
            </div>

            <div className="event-detail__back">
              <Link to="/events" className="btn btn-ghost">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                </svg>
                Все события
              </Link>
            </div>
          </article>

          <aside className="event-detail__sidebar reveal">
            <h4 className="event-detail__sidebar-title">Другие события</h4>
            <div className="event-detail__related">
              {related.map((e) => {
                const rst = STATUS_CONFIG[e.status];
                const rcat = CATEGORY_COLORS[e.category] || CATEGORY_COLORS['Событие'];
                return (
                  <Link key={e.id} to={`/events/${e.id}`} className="event-detail__related-item">
                    <div className="event-detail__related-thumb"
                      style={{ background: e.image ? undefined : e.gradient }}>
                      {e.image && <img src={e.image} alt={e.title} />}
                    </div>
                    <div className="event-detail__related-body">
                      <div className="event-detail__related-top">
                        <span className="event-detail__related-status" style={{ color: rst.color }}>{rst.label}</span>
                        <span className="event-detail__related-cat" style={{ color: rcat.color }}>{e.category}</span>
                      </div>
                      <p className="event-detail__related-title">{e.title}</p>
                      <time className="event-detail__related-dates">{e.dateStart} — {e.dateEnd}</time>
                    </div>
                  </Link>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;