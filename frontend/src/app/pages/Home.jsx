import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logoFullVertical from '/images/logo-icon.svg';
import clanEvg from '/images/ievgi_195x195.png';
import BannerSlider from '../components/ui/BannerSlider';
import { useNews } from '../hooks/useNews';
import { useEvents } from '../hooks/useEvents';
import { TOURNAMENT_TYPES, TIER_ROMAN } from '../data/customsData';
import { useCustomTournaments } from '../hooks/useTournaments';

const BANNER_SLIDES_1 = [
  {
    id: 1,
    type: 'event',
    title: 'Глобальная карта: Сезон «Стальная воля»',
    desc: 'Сражайтесь за территории на глобальной карте и получайте уникальные награды. Сезон продлится до конца месяца.',
    btnLabel: 'Подробнее',
    btnHref: '#',
    bgGradient: 'linear-gradient(135deg, #1a0540 0%, #2d0870 40%, #582BBA 100%)',
  },
  {
    id: 2,
    type: null,
    title: 'Обновление 1.24 уже в игре',
    desc: 'Новые карты, ребаланс техники и режим «Осада крепости» — всё, что нужно знать об обновлении.',
    btnLabel: 'Читать',
    btnHref: '#',
    bgGradient: 'linear-gradient(135deg, #0f1e40 0%, #1a3a6b 50%, #2d5bbf 100%)',
  },
  {
    id: 3,
    type: 'event',
    title: 'Турнир кланов «Железный кулак» — регистрация открыта',
    desc: 'Докажите превосходство своего клана в еженедельном турнире. Призовой фонд 10 000 золота.',
    btnLabel: 'Зарегистрироваться',
    btnHref: '#',
    bgGradient: 'linear-gradient(135deg, #200a00 0%, #8a2200 50%, #FF5000 100%)',
  },
];

const BANNER_SLIDES_2 = [
  {
    id: 1,
    type: null,
    title: 'Пригласи друга — получи награду',
    desc: 'Используй реферальную программу CosmoManager и получай бонусы за каждого приглашённого игрока.',
    btnLabel: 'Узнать больше',
    btnHref: '#',
    bgGradient: 'linear-gradient(135deg, #0a200a 0%, #145214 50%, #22c55e 100%)',
  },
  {
    id: 2,
    type: 'event',
    title: 'Ивент «День танкиста» — специальные миссии',
    desc: 'Выполняй ежедневные миссии и открывай эксклюзивные декали и стиль «Ветеран».',
    btnLabel: 'К миссиям',
    btnHref: '#',
    bgGradient: 'linear-gradient(135deg, #1e1000 0%, #6b3800 50%, #FAB81B 100%)',
  },
  {
    id: 3,
    type: null,
    title: 'CosmoManager Pro — расширенная аналитика',
    desc: 'Глубокий анализ боёв, построение стратегий и управление казной клана в одном месте.',
    btnLabel: 'Попробовать',
    btnHref: '#',
    bgGradient: 'linear-gradient(135deg, #1a0540 0%, #582BBA 60%, #835de4 100%)',
  },
];

const SERVICES_STUB = [
  {
    id: 1,
    path: '/achievements/marks',
    icon: '/images/services/marks.service.svg',
    title: 'Отметки на орудии',
    desc: 'Показатель степени мастерства игроков на танке.',
  },
  {
    id: 2,
    path: '/achievements/masters',
    icon: '/images/services/masters.service.svg',
    title: 'Знак классности мастер',
    desc: 'Необходимое количество опыта для взятия мастера на танке.',
  },
  {
    id: 3,
    path: '/tournaments',
    icon: '/images/services/tournaments.service.svg',
    title: 'Турниры',
    desc: 'Запись, сетки, трансляции и результаты кастомных турниров.',
  },
  {
    id: 5,
    path: '',
    icon: '/images/services/achievements.service.svg',
    title: 'Достижения',
    desc: 'Ваши достижения в удобном и подробном формате.',
  },
  {
    id: 6,
    path: '/clan',
    icon: '/images/services/clans.service.svg',
    title: 'Клан',
    desc: 'Клановые события, активация резервов, глобальная карта и статистика.',
  },
  {
    id: 4,
    path: '',
    icon: '/images/services/recruts.service.svg',
    title: 'Рекрутинг',
    desc: 'Параметры для вступления в клан. Академка и основа.',
  },
];

const SOCIAL_LINKS = [
  {
    id: 'yt',
    label: 'YouTube',
    icon: 'youtube',
    href: '#',
    subs: '12K',
    color: '#FF0000',
    desc: 'Стримы, обзоры и гайды',
  },
  {
    id: 'vk',
    label: 'VK Видео',
    icon: 'vk',
    href: '#',
    subs: '8.5K',
    color: '#0077FF',
    desc: 'Видеозаписи и прямые эфиры',
  },
  {
    id: 'tg',
    label: 'Telegram',
    icon: 'telegram',
    href: '#',
    subs: '3.2K',
    color: '#26A5E4',
    desc: 'Новости и анонсы',
  },
  {
    id: 'wot',
    label: 'Клан WoT',
    icon: 'tank',
    href: '#',
    subs: '45 чел.',
    color: '#FAB81B',
    desc: 'Страница клана EVG',
  },
];

function HomeTournamentCard({ t }) {
  const type = TOURNAMENT_TYPES[t.type] || TOURNAMENT_TYPES.common;

  return (
    <div className="home-tournament card">
      <div className="home-tournament__top">
        <span
          className="home-tournament__type"
          style={{ color: type.color }}
        >
          {type.label}
        </span>

        <span className="home-tournament__tier">
          {TIER_ROMAN[t.tier] ?? t.tier}
        </span>
      </div>

      <h4 className="home-tournament__title">{t.name}</h4>

      <p className="home-tournament__desc">
        {(t.description ?? '').slice(0, 80)}
        {(t.description ?? '').length > 80 ? '...' : ''}
      </p>

      <div className="home-tournament__meta">
        <span>{t.format}</span>
      </div>

      <div className="home-tournament__footer">
        <Link
          to={`/tournaments/custom/details/${t.id}`}
          className="btn btn-ghost btn-sm"
        >
          Подробнее →
        </Link>
      </div>
    </div>
  );
}

function SocialIcon({ type }) {
  switch (type) {
    case 'youtube':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
        </svg>
      );

    case 'vk':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1.01-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.339-3.202C4.91 10.97 4.5 8.79 4.5 8.316c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.864 2.49 2.303 4.675 2.898 4.675.22 0 .322-.102.322-.66V9.999c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.745c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.253-1.406 2.151-3.574 2.151-3.574.119-.254.339-.491.78-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.49-.085.745-.576.745z" />
        </svg>
      );

    case 'telegram':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      );

    default:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 10c0-1.1-.9-2-2-2h-1V6c0-1.1-.9-2-2-2H9C7.9 4 7 4.9 7 6v2H6c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h1v2h10v-2h1c1.1 0 2-.9 2-2v-4zM9 6h6v2H9V6zm9 8H6v-4h12v4z" />
        </svg>
      );
  }
}

function Home() {
  const [hasVisited, setHasVisited] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [donateGoal] = useState(50000);
  const [donateCollected] = useState(18750);
  const section2Ref = useRef(null);

  // ── Данные только с API ──
  const { news, loading: newsLoading } = useNews();
  const { events, loading: eventsLoading } = useEvents();
  const { tournaments, loading: tournamentsLoading } = useCustomTournaments();

  const latestNews = [...news]
    .sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO))
    .slice(0, 5);

  const latestEvents = events
    .filter((e) => e.status === 'active' || e.status === 'soon')
    .sort((a, b) => new Date(a.dateStartISO) - new Date(b.dateStartISO))
    .slice(0, 3);

  const homeTournaments = [...tournaments]
    .sort((a, b) => {
      const order = {
        active: 0,
        registration: 1,
        upcoming: 2,
        finished: 3,
      };

      return (order[a.status] ?? 9) - (order[b.status] ?? 9);
    })
    .slice(0, 4);

  useEffect(() => {
    setHasVisited(Boolean(localStorage.getItem('cm_visited')));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHeroVisible(true);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleHeroCta = () => {
    localStorage.setItem('cm_visited', '1');
    setHasVisited(true);
    section2Ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const donatePercent = Math.min(
    100,
    Math.round((donateCollected / donateGoal) * 100)
  );

  return (
    <div className="wrapper home">
      {/* §1 HERO */}
      <section className="home__hero">
        <div className="home__hero-bg">
          <div className="home__hero-planet" />
          <div className="home__hero-stars" />
        </div>

        <div className="home__hero-overlay" />

        <div className={`home__hero-content${heroVisible ? ' home__hero-content--visible' : ''}`}>
          <div className="home__hero-badges">
            <span className="home__hero-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Скорость
            </span>

            <span className="home__hero-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Удобство
            </span>

            <span className="home__hero-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Универсальность
            </span>
          </div>

          <h1 className="home__hero-title">
            Добро пожаловать в
            <br />
            <span className="home__hero-title-accent">CosmoManager!</span>
          </h1>

          <div className="home__hero-desc">
            <p>
              Всё, что нужно командиру: от глобальной карты до аналитики каждого бойца.
            </p>
          </div>

          <button
            className="btn btn-primary btn-lg home__hero-cta"
            onClick={handleHeroCta}
          >
            {hasVisited ? (
              <>
                Продолжить
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            ) : (
              <>
                Начать
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </>
            )}
          </button>

          <div className="home__hero-collab">
            <div className="home__hero-collab-item">
              <div className="home__hero-collab-glow" />
              <img
                src={logoFullVertical}
                alt="CosmoManager"
                className="home__hero-collab-img"
              />
            </div>

            <span className="home__hero-collab-x">×</span>

            <div className="home__hero-collab-item">
              <div className="home__hero-collab-glow home__hero-collab-glow--gold" />
              <img
                src={clanEvg}
                alt="EVG"
                className="home__hero-collab-img home__hero-collab-img--gold"
              />
            </div>
          </div>
        </div>
      </section>

      {/* §2 BANNER 1 */}
      <section className="home__section home__banner" ref={section2Ref}>
        <div className="container">
          <BannerSlider slides={BANNER_SLIDES_1} />
        </div>
      </section>

      {/* §3 SERVICES */}
      <section className="home__section">
        <div className="container">
          <div className="section-heading reveal">
            <h2>Популярные сервисы</h2>
            <Link to="/services" className="section-link">
              Все сервисы →
            </Link>
          </div>

          <div className="home__services-grid reveal">
            {SERVICES_STUB.map((s) => (
              <Link to={s.path} key={s.id} className="home__service-card card">
                <div className="home__service-card-icon">
                  <img src={s.icon} alt={s.title} />
                </div>

                <div className="home__service-card-body">
                  <h5 className="home__service-card-title">
                    {s.title}
                  </h5>

                  <p className="home__service-card-desc">
                    {s.desc}
                  </p>
                </div>

                <div className="home__service-card-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* §4 NEWS & EVENTS — данные только с API */}
      <section className="home__section">
        <div className="container">
          <div className="section-heading reveal">
            <h2>Новости и события</h2>
            <Link to="/news" className="section-link">
              Все новости →
            </Link>
          </div>

          <div className="home__news-layout reveal">
            {/* Новости */}
            <div className="home__news-col">
              <h4 className="home__news-col-title">
                Последние новости
              </h4>

              <div className="home__news-list">
                {latestNews.length > 0 ? (
                  latestNews.map((n, index) => (
                    <Link
                      key={n.id}
                      to={`/news/${n.id}`}
                      className="home__news-item"
                    >
                      <div className="home__news-item-num">
                        {String(index + 1).padStart(2, '0')}
                      </div>

                      <div className="home__news-item-body">
                        <p className="home__news-item-title">
                          {n.title}
                        </p>

                        <span className="home__news-item-date">
                          {n.date}
                        </span>
                      </div>

                      <svg
                        className="home__news-item-arrow"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)', padding: 'var(--sp-4)' }}>
                    {newsLoading ? 'Загружаем новости...' : 'Новостей пока нет.'}
                  </p>
                )}
              </div>
            </div>

            {/* События */}
            <div className="home__events-col">
              <h4 className="home__news-col-title">
                Текущие события
              </h4>

              <div className="home__events-list">
                {latestEvents.length > 0 ? (
                  latestEvents.map((ev) => (
                    <Link
                      key={ev.id}
                      to={`/events/${ev.id}`}
                      className="home__event-card card"
                    >
                      <div className="home__event-card-header">
                        <span className={`badge ${ev.status === 'active' ? 'badge-active' : 'badge-event'}`}>
                          {ev.status === 'active' ? '● Активно' : '◈ Скоро'}
                        </span>

                        <span className="home__event-card-date">
                          {ev.dateStart}
                        </span>
                      </div>

                      <h5 className="home__event-card-title">
                        {ev.title}
                      </h5>

                      <p className="home__event-card-desc">
                        {ev.excerpt}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)', padding: 'var(--sp-4)' }}>
                    {eventsLoading ? 'Загружаем события...' : 'Событий пока нет.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* §5 TOURNAMENTS */}
      <section className="home__section">
        <div className="container">
          <div className="section-heading reveal">
            <h2>Турниры</h2>
            <Link to="/tournaments" className="section-link">
              Все турниры →
            </Link>
          </div>

          <div className="home__tournaments-grid reveal">
            {homeTournaments.length > 0 ? (
              homeTournaments.map((t) => (
                <HomeTournamentCard key={t.id} t={t} />
              ))
            ) : (
              <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>
                {tournamentsLoading ? 'Загружаем турниры...' : 'Турниров пока нет.'}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* §6 DONATE */}
      <section className="home__section">
        <div className="container reveal">
          <div className="home__donate">
            <div className="home__donate-bg" />

            <div className="home__donate-content">
              <div className="home__donate-left">
                <span className="badge badge-event home__donate-badge">
                  Поддержка проекта
                </span>

                <h2 className="home__donate-title">
                  Помоги нам расти
                </h2>

                <p className="home__donate-desc">
                  CosmoManager — бесплатный инструмент для танкистов. Твоя поддержка помогает оплачивать сервера, разработку новых функций и развитие платформы.
                </p>

                <div className="home__donate-goal">
                  <div className="home__donate-goal-label">
                    <span>На что собираем</span>
                    <strong>Новый выделенный сервер</strong>
                  </div>

                  <div className="home__donate-progress">
                    <div className="home__donate-progress-track">
                      <div
                        className="home__donate-progress-fill"
                        style={{ width: `${donatePercent}%` }}
                      />
                    </div>

                    <div className="home__donate-progress-meta">
                      <span className="home__donate-collected">
                        {donateCollected.toLocaleString('ru-RU')} ₽
                      </span>

                      <span className="home__donate-percent">
                        {donatePercent}%
                      </span>

                      <span className="home__donate-remaining">
                        ещё {(donateGoal - donateCollected).toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  </div>
                </div>

                <button className="btn btn-gold btn-lg home__donate-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  Поддержать проект
                </button>
              </div>

              <div className="home__donate-right">
                {[
                  { value: `${donateCollected.toLocaleString('ru-RU')} ₽`, label: 'Собрано' },
                  { value: `${donateGoal.toLocaleString('ru-RU')} ₽`, label: 'Цель' },
                  { value: `${donatePercent}%`, label: 'Выполнено' },
                  { value: '142', label: 'Поддержало' },
                ].map((s) => (
                  <div key={s.label} className="home__donate-stat">
                    <div className="home__donate-stat-value">
                      {s.value}
                    </div>

                    <div className="home__donate-stat-label">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* §7 BANNER 2 */}
      <section className="home__section home__banner">
        <div className="container">
          <BannerSlider slides={BANNER_SLIDES_2} />
        </div>
      </section>

      {/* §8 SOCIAL */}
      <section className="home__section home__section--last">
        <div className="container">
          <div className="section-heading reveal">
            <h2>Наши площадки</h2>
          </div>

          <div className="home__social-grid reveal">
            <div className="home__social-big card">
              <div className="home__social-big-bg home__social-big-bg--yt" />
              <div className="home__social-big-overlay" />

              <div className="home__social-big-content">
                <div className="home__social-platform">
                  <div
                    className="home__social-platform-icon"
                    style={{ color: '#FF0000' }}
                  >
                    <SocialIcon type="youtube" />
                  </div>

                  <div>
                    <div className="home__social-platform-name">
                      YouTube
                    </div>

                    <div className="home__social-platform-subs">
                      12K подписчиков
                    </div>
                  </div>
                </div>

                <p className="home__social-big-desc">
                  Стримы с кланваров, обзоры обновлений и обучающие гайды от командиров EVG
                </p>

                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Смотреть
                </a>
              </div>

              <div className="home__social-videos">
                {[1, 2, 3].map((video) => (
                  <a key={video} href="#" className="home__social-video">
                    <div className="home__social-video-thumb">
                      <div className="home__social-video-play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    </div>

                    <p className="home__social-video-title">
                      Кланвар — финал сезона #0{video}
                    </p>
                  </a>
                ))}
              </div>
            </div>

            <div className="home__social-small-col">
              {SOCIAL_LINKS.slice(1).map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="home__social-small card"
                  style={{ '--social-color': s.color }}
                >
                  <div
                    className="home__social-small-icon"
                    style={{ color: s.color }}
                  >
                    <SocialIcon type={s.icon} />
                  </div>

                  <div className="home__social-small-body">
                    <div className="home__social-small-name">
                      {s.label}
                    </div>

                    <div className="home__social-small-desc">
                      {s.desc}
                    </div>

                    <div className="home__social-small-subs">
                      {s.subs}
                    </div>
                  </div>

                  <svg
                    className="home__social-small-arrow"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;