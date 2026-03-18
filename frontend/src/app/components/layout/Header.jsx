import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import logoFull from '/images/logo-full.svg';

const NAV_LINKS = [
  { to: '/', label: 'Главная' },
  { to: '/services', label: 'Сервисы' },
  { to: '/tournaments', label: 'Турниры' },
  { to: '/clan', label: 'Клан' },
];

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false); // заменить на реальный контекст
  const menuRef = useRef(null);
  const burgerRef = useRef(null);

  /* Scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close menu on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (
        menuOpen &&
        menuRef.current && !menuRef.current.contains(e.target) &&
        burgerRef.current && !burgerRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  /* Close menu on route change / resize */
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* Prevent body scroll when menu open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <header className={`header${scrolled ? ' header--scrolled' : ''}`}>
        <div className="container header__inner">

          {/* Logo */}
          <Link to="/" className="header__logo" onClick={() => setMenuOpen(false)}>
            <img src={logoFull} alt="CosmoManager" className="header__logo-img" />
          </Link>

          {/* Desktop nav */}
          <nav className="header__nav" aria-label="Основная навигация">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `header__nav-link${isActive ? ' header__nav-link--active' : ''}`
                }
                end={to === '/'}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="header__actions">
            {/* Support */}
            <button className="btn btn-ghost btn-icon header__support" title="Поддержать проект">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            {/* Auth */}
            {isAuthed ? (
              <>
                <button className="btn btn-ghost header__profile">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Профиль</span>
                </button>
                <button className="btn btn-ghost" onClick={() => setIsAuthed(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => setIsAuthed(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Войти
              </button>
            )}
          </div>

          {/* Burger (mobile) */}
          <button
            ref={burgerRef}
            className={`header__burger${menuOpen ? ' header__burger--open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Меню"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Mobile menu backdrop */}
      <div
        className={`mobile-backdrop${menuOpen ? ' mobile-backdrop--visible' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden
      />

      {/* Mobile drawer */}
      <nav
        ref={menuRef}
        className={`mobile-menu${menuOpen ? ' mobile-menu--open' : ''}`}
        aria-label="Мобильная навигация"
      >
        <div className="mobile-menu__header">
          <img src={logoFull} alt="CosmoManager" className="mobile-menu__logo" />
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setMenuOpen(false)}
            aria-label="Закрыть меню"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mobile-menu__links">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `mobile-menu__link${isActive ? ' mobile-menu__link--active' : ''}`
              }
              end={to === '/'}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="mobile-menu__footer">
          <button className="btn btn-ghost mobile-menu__support">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Поддержать
          </button>
          {isAuthed ? (
            <button className="btn btn-ghost" onClick={() => { setIsAuthed(false); setMenuOpen(false); }}>
              Выйти
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => { setIsAuthed(true); setMenuOpen(false); }}>
              Войти
            </button>
          )}
        </div>
      </nav>
    </>
  );
}

export default Header;