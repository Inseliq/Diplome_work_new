import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Страница «Всё сломалось — чиним».
 *
 * Props:
 *   message  — кастомный текст (необязательно)
 *   srcPage  — путь для кнопки «Назад» (необязательно)
 *              Если не передан — кнопка не отображается.
 *
 * Использование:
 *   <Maintenance />
 *   <Maintenance message="Обновляем сервера" srcPage="/news/5" />
 *
 * Через URL: /maintenance?src-page=/events/2
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

/* Мигающий счётчик — имитация "чинят прямо сейчас" */
function ActivityDot() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 1) % 3), 600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="mnt-dots">
      {[0, 1, 2].map((i) => (
        <span key={i} className={`mnt-dot${phase === i ? ' mnt-dot--active' : ''}`} />
      ))}
    </div>
  );
}

function Maintenance({ message, srcPage }) {
  const src = getSrcPage(srcPage);
  const backLabel = parseSrcLabel(src);

  return (
    <div className="wrapper svc-page svc-page--mnt">
      <div className="svc-page__bg">
        <div className="svc-page__bg-glow svc-page__bg-glow--mnt-1" />
        <div className="svc-page__bg-glow svc-page__bg-glow--mnt-2" />
      </div>

      {/* Летящие частицы */}
      <div className="svc-page__particles" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`svc-particle svc-particle--${i + 1}`} />
        ))}
      </div>

      <div className="svc-page__content">
        {/* Иконка с вращением */}
        <div className="mnt-icon-wrap">
          <svg className="mnt-icon-spin" width="56" height="56" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2" />
          </svg>
          <div className="mnt-icon-pulse" />
        </div>

        <div className="mnt-status-row">
          <ActivityDot />
          <span className="mnt-status-text">Мы знаем о проблеме и уже всё чиним</span>
        </div>

        <h1 className="svc-page__title">Что-то пошло не&nbsp;так</h1>
        <p className="svc-page__desc">
          {message ?? 'Мы обнаружили неисправность и уже работаем над устранением. Попробуйте вернуться через несколько минут.'}
        </p>

        {/* Тикер статуса */}
        <div className="mnt-ticker">
          <div className="mnt-ticker__inner">
            <span>СЕРВЕР ВОССТАНАВЛИВАЕТСЯ</span>
            <span>•</span>
            <span>СКОРО ВСЁ ЗАРАБОТАЕТ</span>
            <span>•</span>
            <span>СПАСИБО ЗА ТЕРПЕНИЕ</span>
            <span>•</span>
            <span>СЕРВЕР ВОССТАНАВЛИВАЕТСЯ</span>
            <span>•</span>
            <span>СКОРО ВСЁ ЗАРАБОТАЕТ</span>
            <span>•</span>
          </div>
        </div>

        <div className="svc-page__actions">
          <button className="btn btn-ghost svc-page__btn" onClick={() => window.location.reload()}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
            </svg>
            Перезагрузить
          </button>

          <Link to="/" className="btn btn-primary svc-page__btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            На главную
          </Link>

          {src && (
            <Link to={src} className="btn btn-ghost svc-page__btn">
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

export default Maintenance;