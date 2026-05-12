import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Страница «Функция в разработке».
 *
 * Props:
 *   title       — заголовок фичи (необязательно)
 *   description — описание (необязательно)
 *   srcPage     — путь для кнопки «Вернуться» (например "/events/1")
 *                 Если не передан — кнопка не отображается.
 *
 * Использование:
 *   <InDevelopment />
 *   <InDevelopment title="Статистика игрока" srcPage="/events/3" />
 *
 * Через URL: если страница вызывается с query-параметром src-page,
 * кнопка «Назад» появится автоматически.
 * Пример: /development?src-page=/events/2
 */

function getSrcPage(prop) {
  if (prop) return prop;
  const params = new URLSearchParams(window.location.search);
  return params.get('src-page') ?? null;
}

function parseSrcLabel(src) {
  if (!src) return null;
  if (src.startsWith('/events')) return 'Посмотреть событие';
  if (src.startsWith('/news')) return 'Посмотреть новость';
  if (src.startsWith('/tournaments')) return 'К турниру';
  return 'Назад';
}

function InDevelopment({ title, description, srcPage }) {
  const src = getSrcPage(srcPage);
  const backLabel = parseSrcLabel(src);

  return (
    <div className="wrapper svc-page svc-page--dev">
      <div className="svc-page__bg">
        <div className="svc-page__bg-glow svc-page__bg-glow--dev-1" />
        <div className="svc-page__bg-glow svc-page__bg-glow--dev-2" />
      </div>

      {/* Анимированные орбиты */}
      <div className="svc-page__orbits" aria-hidden="true">
        <div className="svc-orbit svc-orbit--1">
          <div className="svc-orbit__dot" />
        </div>
        <div className="svc-orbit svc-orbit--2">
          <div className="svc-orbit__dot" />
        </div>
        <div className="svc-orbit svc-orbit--3">
          <div className="svc-orbit__dot" />
        </div>
      </div>

      <div className="svc-page__content">
        {/* Анимированный значок */}
        <div className="svc-dev__icon-wrap">
          <div className="svc-dev__icon-ring" />
          <div className="svc-dev__icon-ring svc-dev__icon-ring--2" />
          <svg className="svc-dev__icon-svg" width="48" height="48" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        <div className="svc-dev__status-badge">
          <span className="svc-dev__status-dot" />
          В разработке
        </div>

        <h1 className="svc-page__title">
          {title ?? 'Скоро здесь что-то появится'}
        </h1>
        <p className="svc-page__desc">
          {description ?? 'Мы активно работаем над этой функцией. Она будет доступна в ближайшем обновлении CosmoManager.'}
        </p>

        {/* Прогресс-бар с анимацией */}
        <div className="svc-dev__progress">
          <div className="svc-dev__progress-bar">
            <div className="svc-dev__progress-fill" />
          </div>
          <span className="svc-dev__progress-label">Идёт разработка...</span>
        </div>

        <div className="svc-page__actions">
          <Link to="/" className="btn btn-ghost svc-page__btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            На главную
          </Link>

          {src && (
            <Link to={src} className="btn btn-primary svc-page__btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              {backLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default InDevelopment;