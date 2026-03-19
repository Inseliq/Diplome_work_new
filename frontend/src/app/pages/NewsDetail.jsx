import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { NEWS_DATA, CATEGORY_COLORS } from '../data/newsData';
import { parseMarkup } from '../utils/parseMarkup';

// Сортируем для блока "Другие новости"
const SORTED = [...NEWS_DATA].sort(
  (a, b) => new Date(b.dateISO) - new Date(a.dateISO)
);

function NewsDetail() {
  const { id } = useParams();
  const item = NEWS_DATA.find((n) => n.id === Number(id));

  if (!item) return <Navigate to="/news" replace />;

  const cat = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Платформа'];
  const related = SORTED.filter((n) => n.id !== item.id).slice(0, 3);

  return (
    <div className="wrapper news-detail">
      <div className="container">

        {/* Breadcrumb */}
        <nav className="news-detail__breadcrumb reveal">
          <Link to="/" className="news-detail__crumb">Главная</Link>
          <span className="news-detail__crumb-sep">/</span>
          <Link to="/news" className="news-detail__crumb">Новости</Link>
          <span className="news-detail__crumb-sep">/</span>
          <span className="news-detail__crumb news-detail__crumb--active">{item.title}</span>
        </nav>

        <div className="news-detail__layout">

          {/* ── Main article ── */}
          <article className="news-detail__article reveal">

            {/* Hero image / gradient */}
            <div className="news-detail__hero">
              {item.image
                ? <img src={item.image} alt={item.title} className="news-detail__hero-img" />
                : <div className="news-detail__hero-gradient" style={{ background: item.gradient }} />
              }
              <div className="news-detail__hero-overlay" />
              <div className="news-detail__hero-meta">
                <span
                  className="news-detail__category"
                  style={{ color: cat.color, background: cat.bg, borderColor: cat.border }}
                >
                  {item.category}
                </span>
                <time className="news-detail__date" dateTime={item.dateISO}>{item.date}</time>
              </div>
            </div>

            {/* Title */}
            <h1 className="news-detail__title">{item.title}</h1>
            <p className="news-detail__excerpt">{item.excerpt}</p>

            <div className="news-detail__divider" />

            {/* Markup content */}
            <div className="news-detail__content markup">
              {parseMarkup(item.content)}
            </div>

            {/* Back */}
            <div className="news-detail__back">
              <Link to="/news" className="btn btn-ghost">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Все новости
              </Link>
            </div>
          </article>

          {/* ── Sidebar ── */}
          <aside className="news-detail__sidebar reveal">
            <h4 className="news-detail__sidebar-title">Другие новости</h4>
            <div className="news-detail__related">
              {related.map((n) => {
                const rc = CATEGORY_COLORS[n.category] || CATEGORY_COLORS['Платформа'];
                return (
                  <Link key={n.id} to={`/news/${n.id}`} className="news-detail__related-item">
                    <div
                      className="news-detail__related-thumb"
                      style={{ background: n.image ? undefined : n.gradient }}
                    >
                      {n.image && <img src={n.image} alt={n.title} />}
                    </div>
                    <div className="news-detail__related-body">
                      <span
                        className="news-detail__related-cat"
                        style={{ color: rc.color }}
                      >
                        {n.category}
                      </span>
                      <p className="news-detail__related-title">{n.title}</p>
                      <time className="news-detail__related-date">{n.date}</time>
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

export default NewsDetail;