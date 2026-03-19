import React from 'react';

// Заглушки видео — замените src/href на реальные данные
const VIDEOS = [
  {
    id: 1,
    title: 'Финал Кубка Чемпионов — EVG vs IronFist',
    href: 'https://youtube.com',
    thumb: null, // путь до превью или null → градиент
    gradient: 'linear-gradient(135deg, #1a0540 0%, #582BBA 60%, #835de4 100%)',
    duration: '18:42',
    views: '4.2K',
    date: '15 марта 2025',
  },
  {
    id: 2,
    title: 'Гайд: ТОП-10 ТТ для кланваров в 2025',
    href: 'https://youtube.com',
    thumb: null,
    gradient: 'linear-gradient(135deg, #200a00 0%, #8a2200 50%, #FF5000 100%)',
    duration: '12:17',
    views: '8.1K',
    date: '10 марта 2025',
  },
  {
    id: 3,
    title: 'Разбор боёв на Глобальной карте — сезон «Стальная воля»',
    href: 'https://youtube.com',
    thumb: null,
    gradient: 'linear-gradient(135deg, #0f1e40 0%, #1a3a6b 50%, #2d5bbf 100%)',
    duration: '24:05',
    views: '3.6K',
    date: '7 марта 2025',
  },
  {
    id: 4,
    title: 'Обзор обновления 1.24 — что изменилось?',
    href: 'https://youtube.com',
    thumb: null,
    gradient: 'linear-gradient(135deg, #0a200a 0%, #145214 50%, #22c55e 100%)',
    duration: '9:54',
    views: '11.3K',
    date: '4 марта 2025',
  },
];

const PLATFORMS = [
  {
    id: 'youtube',
    name: 'YouTube',
    href: 'https://youtube.com/@cosmomanager',
    color: '#FF0000',
    bg: 'rgba(255,0,0,0.08)',
    border: 'rgba(255,0,0,0.2)',
    subs: '12K подписчиков',
    desc: 'Стримы, обзоры обновлений и гайды от командиров EVG',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
      </svg>
    ),
  },
  {
    id: 'vk',
    name: 'VK Видео',
    href: 'https://vk.com/video/@cosmomanager',
    color: '#0077FF',
    bg: 'rgba(0,119,255,0.08)',
    border: 'rgba(0,119,255,0.2)',
    subs: '8.5K подписчиков',
    desc: 'Видеозаписи кланваров, прямые эфиры и анонсы событий',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1.01-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.339-3.202C4.91 10.97 4.5 8.79 4.5 8.316c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.864 2.49 2.303 4.675 2.898 4.675.22 0 .322-.102.322-.66V9.999c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.745c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.253-1.406 2.151-3.574 2.151-3.574.119-.254.339-.491.78-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.49-.085.745-.576.745z" />
      </svg>
    ),
  },
  {
    id: 'telegram',
    name: 'Telegram',
    href: 'https://t.me/cosmomanager',
    color: '#26A5E4',
    bg: 'rgba(38,165,228,0.08)',
    border: 'rgba(38,165,228,0.2)',
    subs: '3.2K подписчиков',
    desc: 'Новости платформы, анонсы событий и важные обновления',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    id: 'wot',
    name: 'Клан WoT',
    href: 'https://worldoftanks.ru/ru/community/clans/',
    color: '#FAB81B',
    bg: 'rgba(250,184,27,0.08)',
    border: 'rgba(250,184,27,0.2)',
    subs: '45 участников',
    desc: 'Официальная страница клана EVG в Мире Танков',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 10c0-1.1-.9-2-2-2h-1V6c0-1.1-.9-2-2-2H9C7.9 4 7 4.9 7 6v2H6c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h1v2h10v-2h1c1.1 0 2-.9 2-2v-4zM9 6h6v2H9V6zm9 8H6v-4h12v4z" />
      </svg>
    ),
  },
];

function PlayIcon() {
  return (
    <div className="social-video__play">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    </div>
  );
}

function Social() {
  const [main, ...rest] = VIDEOS;

  return (
    <div className="wrapper social">
      <div className="container">

        {/* ── Header ── */}
        <div className="social__header reveal">
          <div className="social__header-label">Сообщество</div>
          <h1 className="social__title">Социальные сети</h1>
          <p className="social__subtitle">
            Видео, новости и официальные каналы проекта
          </p>
        </div>

        {/* ── Блок видео ── */}
        <section className="social__videos reveal">
          <div className="social__videos-header">
            <h2 className="social__section-title">Последние видео</h2>
            <a href="https://youtube.com/@cosmomanager" target="_blank" rel="noopener noreferrer"
              className="btn btn-ghost btn-sm social__all-link">
              Все видео
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>

          <div className="social__videos-grid">

            {/* Главное видео — большое */}
            <a href={main.href} target="_blank" rel="noopener noreferrer"
              className="social-video social-video--main">
              <div className="social-video__thumb">
                {main.thumb
                  ? <img src={main.thumb} alt={main.title} />
                  : <div className="social-video__gradient" style={{ background: main.gradient }} />
                }
                <div className="social-video__overlay" />
                <PlayIcon />
                <span className="social-video__duration">{main.duration}</span>
              </div>
              <div className="social-video__info">
                <p className="social-video__title">{main.title}</p>
                <div className="social-video__meta">
                  <span>{main.views} просмотров</span>
                  <span>{main.date}</span>
                </div>
              </div>
            </a>

            {/* Маленькие видео */}
            <div className="social__videos-side">
              {rest.map((v) => (
                <a key={v.id} href={v.href} target="_blank" rel="noopener noreferrer"
                  className="social-video social-video--small">
                  <div className="social-video__thumb">
                    {v.thumb
                      ? <img src={v.thumb} alt={v.title} />
                      : <div className="social-video__gradient" style={{ background: v.gradient }} />
                    }
                    <div className="social-video__overlay" />
                    <PlayIcon />
                    <span className="social-video__duration">{v.duration}</span>
                  </div>
                  <div className="social-video__info">
                    <p className="social-video__title">{v.title}</p>
                    <div className="social-video__meta">
                      <span>{v.views} просмотров</span>
                      <span>{v.date}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

          </div>
        </section>

        {/* ── Платформы ── */}
        <section className="social__platforms reveal">
          <h2 className="social__section-title">Наши платформы</h2>
          <div className="social__platforms-grid">
            {PLATFORMS.map((p) => (
              <a key={p.id} href={p.href} target="_blank" rel="noopener noreferrer"
                className="social-platform-card"
                style={{ '--p-color': p.color, '--p-bg': p.bg, '--p-border': p.border }}>
                <div className="social-platform-card__glow" />
                <div className="social-platform-card__icon" style={{ color: p.color, background: p.bg, borderColor: p.border }}>
                  {p.icon}
                </div>
                <div className="social-platform-card__body">
                  <div className="social-platform-card__name">{p.name}</div>
                  <div className="social-platform-card__subs" style={{ color: p.color }}>{p.subs}</div>
                  <p className="social-platform-card__desc">{p.desc}</p>
                </div>
                <div className="social-platform-card__arrow">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default Social;