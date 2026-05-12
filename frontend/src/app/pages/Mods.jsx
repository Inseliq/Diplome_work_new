import React, { useState } from 'react';

const MOD_URL = 'https://lebwa.tv/storage/mods/mt/lebwa_modpack_2026.04.15.02.exe';
const LEBWA_URL = 'https://lebwa.tv/hub/modpack-lebwa';
const LEBWA_PLUS = 'https://lebwa.tv/subscribe/instruction';

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
    title: 'Для зрителей',
    desc: 'Эксклюзивные видео и медиа, доступные только подписчикам Левша Плюс.',
    color: '#a855f7',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: 'Для игроков',
    desc: 'Расширенная статистика и персональные рекомендации по технике и тактике.',
    color: '#22c55e',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
      </svg>
    ),
    title: 'Для профессионалов',
    desc: 'Закрытые турниры для самых амбициозных игроков с уникальными призами.',
    color: '#FAB81B',
  },
];

function Mods() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 3000);
    window.location.href = MOD_URL;
  };

  return (
    <div className="wrapper mods">
      <div className="container">

        {/* ── Header ── */}
        <div className="mods__header reveal">
          <div className="mods__header-label">Моды</div>
          <h1 className="mods__title">Модпак Левши</h1>
          <p className="mods__subtitle">
            Официальный модпак от стримера Левши — быстрый доступ для клана&nbsp;EVG
          </p>
        </div>

        {/* ── Download card ── */}
        <div className="mods__download-card reveal">
          <div className="mods__download-card__glow" />

          <div className="mods__download-info">
            <div className="mods__download-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Версия 2026.04.15.02
            </div>
            <h2 className="mods__download-title">Lebwa ModPack</h2>
            <p className="mods__download-desc">
              Авторский модпак Левши для World of Tanks. Оптимальные настройки прицелов,
              хитлога, маркеров и прочих модулей. Регулярно обновляется под актуальную версию клиента.
            </p>
            <div className="mods__download-meta">
              <span className="mods__meta-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Актуальный патч
              </span>
              <span className="mods__meta-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Безопасный
              </span>
              <span className="mods__meta-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                От Левши
              </span>
            </div>
          </div>

          <div className="mods__download-actions">
            <button
              className={`btn btn-primary mods__download-btn${downloading ? ' mods__download-btn--loading' : ''}`}
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
                  </svg>
                  Загрузка...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Скачать .exe
                </>
              )}
            </button>
            <a href={LEBWA_URL} target="_blank" rel="noopener noreferrer"
              className="btn btn-ghost mods__site-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Сайт lebwa.tv
            </a>
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <div className="mods__disclaimer reveal">
          <div className="mods__disclaimer__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="mods__disclaimer__body">
            <p className="mods__disclaimer__title">Важное уведомление</p>
            <p className="mods__disclaimer__text">
              Модпак является авторским продуктом{' '}
              <a href={LEBWA_URL} target="_blank" rel="noopener noreferrer"
                className="mods__disclaimer__link">
                Левши (lebwa.tv)
              </a>
              . Клан EVG и платформа CosmoManager не имеют никаких прав на данный продукт
              и не несут ответственности за его содержимое. Эта страница создана
              исключительно для удобства участников клана — чтобы не искать ссылку каждый
              раз самостоятельно. Все права принадлежат автору.
            </p>
          </div>
        </div>

        {/* ── Lebwa Plus ── */}
        <div className="mods__plus reveal">
          <div className="mods__plus__header">
            <div className="mods__plus__badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Подписка
            </div>
            <h2 className="mods__plus__title">
              Левша&nbsp;<span className="mods__plus__title-plus">Плюс</span>
            </h2>
            <p className="mods__plus__desc">
              Авторский продукт, созданный для тех, кто хочет получать больше —
              больше контента, больше аналитики и больше возможностей.
            </p>
          </div>

          <div className="mods__plus__grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="mods__plus__card" style={{ '--feat-color': f.color }}>
                <div className="mods__plus__card-icon" style={{ color: f.color }}>
                  {f.icon}
                </div>
                <h3 className="mods__plus__card-title">{f.title}</h3>
                <p className="mods__plus__card-desc">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mods__plus__cta">
            <a href={LEBWA_PLUS} target="_blank" rel="noopener noreferrer"
              className="btn btn-primary mods__plus__btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Узнать о Левша Плюс
            </a>
            <span className="mods__plus__cta-note">На сайте lebwa.tv</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Mods;