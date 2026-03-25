import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNews } from '../hooks/useNews';
import { CATEGORY_COLORS } from '../data/newsData';
import { LoadingSpinner, FallbackBanner } from '../components/ui/StatusComponents';

const PAGE_SIZE = 9;

function NewsCard({ item }) {
  const cat = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Платформа'];
  return (
    <Link to={`/news/${item.id}`} className="news-card">
      <div className="news-card__thumb">
        {item.image
          ? <img src={item.image} alt={item.title} className="news-card__img" />
          : <div className="news-card__gradient" style={{ background: item.gradient }} />
        }
        <span className="news-card__category"
          style={{ color: cat.color, background: cat.bg, borderColor: cat.border }}>
          {item.category}
        </span>
      </div>
      <div className="news-card__body">
        <time className="news-card__date" dateTime={item.dateISO}>{item.date}</time>
        <h3 className="news-card__title">{item.title}</h3>
        <p className="news-card__excerpt">{item.excerpt}</p>
      </div>
      <div className="news-card__footer">
        <span className="news-card__read">Читать</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
    </Link>
  );
}

function News() {
  const { news, loading, isFallback } = useNews();
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Сортируем по дате убыванию
  const sorted = [...news].sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO));
  const shown = sorted.slice(0, visible);
  const hasMore = visible < sorted.length;

  return (
    <div className="wrapper news-list">
      <div className="container">

        <div className="news-list__header reveal">
          <div className="news-list__header-label">Медиа</div>
          <h1 className="news-list__title">Новости</h1>
          <p className="news-list__subtitle">Обновления платформы, гайды и события игры</p>
        </div>

        {isFallback && <FallbackBanner />}

        {loading ? (
          <LoadingSpinner text="Загружаем новости..." />
        ) : (
          <>
            <div className="news-list__grid reveal">
              {shown.map((item) => <NewsCard key={item.id} item={item} />)}
            </div>

            {hasMore && (
              <div className="news-list__more reveal">
                <button className="btn btn-ghost btn-lg news-list__more-btn"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  Показать ещё
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <span className="news-list__counter">
                  Показано {shown.length} из {sorted.length}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default News;