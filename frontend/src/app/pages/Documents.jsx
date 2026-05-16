import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DOCUMENTS, DOCUMENT_KEYS } from '../data/documentsData';
import { parseDocMarkdown } from '../utils/parseDocMarkdown';

const DEFAULT_DOCUMENT_KEY = 'privacy_policy';

const SECTION_ICONS = {
  about: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  privacy_policy: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  use_data_policy: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  user_guide: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  license: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

function Documents() {
  const { documentKey } = useParams();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const contentRef = useRef(null);

  const activeKey = DOCUMENTS[documentKey]
    ? documentKey
    : DEFAULT_DOCUMENT_KEY;

  const doc = DOCUMENTS[activeKey];
  const nodes = parseDocMarkdown(doc.content, activeKey);

  useEffect(() => {
    if (documentKey && !DOCUMENTS[documentKey]) {
      navigate(`/documents/${DEFAULT_DOCUMENT_KEY}`, { replace: true });
    }
  }, [documentKey, navigate]);

  useEffect(() => {
    setMenuOpen(false);

    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeKey]);

  return (
    <div className="docs-wrapper">

      {/* ── Aside ── */}
      <aside className={`docs-aside${menuOpen ? ' docs-aside--open' : ''}`}>
        <div className="docs-aside__header">
          <span className="docs-aside__label">Документация</span>
        </div>

        <nav className="docs-aside__nav">
          {DOCUMENT_KEYS.map((key) => {
            const d = DOCUMENTS[key];

            return (
              <Link
                key={key}
                to={`/documents/${key}`}
                className={`docs-aside__item${activeKey === key ? ' docs-aside__item--active' : ''}`}
              >
                <span className="docs-aside__item-icon">
                  {SECTION_ICONS[key]}
                </span>

                <span className="docs-aside__item-label">
                  {d.title}
                </span>

                {activeKey === key && (
                  <span className="docs-aside__item-dot" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="docs-aside__footer">
          <span className="docs-aside__footer-note">
            CosmoManager v1.0
          </span>
        </div>
      </aside>

      {/* ── Мобильная кнопка ── */}
      <button
        className={`docs-mobile-toggle${menuOpen ? ' docs-mobile-toggle--open' : ''}`}
        onClick={() => setMenuOpen((value) => !value)}
        aria-label="Меню документации"
        type="button"
      >
        {menuOpen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}

        <span>{doc.title}</span>
      </button>

      {/* ── Оверлей мобильного меню ── */}
      {menuOpen && (
        <div
          className="docs-mobile-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ── Основной контент ── */}
      <main className="docs-content" ref={contentRef}>
        <div className="docs-content__inner">
          <article className="docs-article">
            {nodes}
          </article>

          <div className="docs-content__footer">
            <span>CosmoManager — {doc.title}</span>
          </div>
        </div>
      </main>

    </div>
  );
}

export default Documents;