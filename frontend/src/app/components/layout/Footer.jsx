import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoFull from '/images/logo-full.svg';
import logoFullVertical from '/images/logo-full.vertical.svg';

const lestaLogo = '/assets/lesta.svg';
const mtLogo = '/assets/mt.svg';

const SERVICES_LINKS = [
  { label: 'Управление кланом', to: '/services/clan-management' },
  { label: 'Статистика игроков', to: '/services/player-stats' },
  { label: 'Планировщик боёв', to: '/services/battle-planner' },
  { label: 'Казна клана', to: '/services/treasury' },
  { label: 'Рекрутинг', to: '/services/recruitment' },
];

const INFO_LINKS = [
  { label: 'О нас', to: '/about' },
  { label: 'Руководство пользователя', to: '/guide' },
  { label: 'Правила', to: '/rules' },
  { label: 'Информация', to: '/info' },
  { label: 'Конфиденциальность', to: '/privacy' },
];

function Footer() {
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLink = (e, to) => {
    e.preventDefault();
    if (location.pathname === to) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(to);
      // Layout.useScrollToTopOnNavigate сам поднимет страницу
    }
  };

  return (
    <footer className="footer">

      {/* Partners */}
      <div className="footer__partners">
        <div className="container footer__partners-inner">
          <a href="https://lesta.ru" target="_blank" rel="noopener noreferrer" className="footer__partner-link">
            <img src={lestaLogo} alt="Lesta Games" className="footer__partner-img" />
          </a>
          <a href="/" onClick={(e) => handleLink(e, '/')} className="footer__partner-link footer__partner-link--center">
            <img src={logoFull} alt="CosmoManager" className="footer__partner-img footer__partner-img--main" />
          </a>
          <a href="https://worldoftanks.ru" target="_blank" rel="noopener noreferrer" className="footer__partner-link">
            <img src={mtLogo} alt="Мир Танков" className="footer__partner-img" />
          </a>
        </div>
      </div>

      <div className="footer__divider" />

      {/* Main grid */}
      <div className="container footer__main">

        {/* Col 1 — Brand */}
        <div className="footer__col footer__col--brand">
          <a href="/" onClick={(e) => handleLink(e, '/')} className="footer__brand-logo">
            <img src={logoFullVertical} alt="CosmoManager" className="footer__brand-img" />
          </a>
          <div>
            <p className="footer__brand-desc">
              Инструменты для управления кланом Мир Танков.<br />
              Точнее. Быстрее. Удобнее.
            </p>
            <div className="footer__brand-badges">
              <span className="badge badge-active">v1.0</span>
              <span className="badge badge-event">Beta</span>
            </div>
          </div>
        </div>

        {/* Col 2 — Services */}
        <div className="footer__col">
          <h6 className="footer__col-title">Сервисы</h6>
          <ul className="footer__links">
            {SERVICES_LINKS.map(({ label, to }) => (
              <li key={to}>
                <a href={to} onClick={(e) => handleLink(e, to)} className="footer__link">{label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Social */}
        <div className="footer__col">
          <h6 className="footer__col-title">Соц. сети</h6>
          <ul className="footer__links">
            <li>
              <a href="mailto:support@cosmomanager.ru" className="footer__link footer__link--icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                support@cosmomanager.ru
              </a>
            </li>
            <li>
              <a href="https://t.me/cosmomanager" target="_blank" rel="noopener noreferrer" className="footer__link footer__link--icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                Telegram
              </a>
            </li>
          </ul>
          <div className="footer__action-btns">
            <button className="btn btn-gold btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Поддержать
            </button>
            <button className="btn btn-ghost btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Сообщить об ошибке
            </button>
          </div>
        </div>

        {/* Col 4 — Info */}
        <div className="footer__col">
          <h6 className="footer__col-title">Информация</h6>
          <ul className="footer__links">
            {INFO_LINKS.map(({ label, to }) => (
              <li key={to}>
                <a href={to} onClick={(e) => handleLink(e, to)} className="footer__link">{label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer__divider" />

      {/* Bottom */}
      <div className="container footer__bottom">
        <p>© {year} CosmoManager. Все права защищены.</p>
        <p>Не является официальным продуктом Lesta Games</p>
      </div>
    </footer>
  );
}

export default Footer;