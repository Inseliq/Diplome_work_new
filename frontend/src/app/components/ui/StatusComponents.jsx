import React from 'react';

/**
 * Индикатор загрузки.
 */
export function LoadingSpinner({ text = 'Загрузка...' }) {
  return (
    <div className="loading-state">
      <div className="loading-state__spinner" />
      <span className="loading-state__text">{text}</span>
    </div>
  );
}

/**
 * Баннер о том что данные из кеша.
 */
export function FallbackBanner() {
  return (
    <div className="fallback-banner">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      Сервер недоступен — показаны кешированные данные
    </div>
  );
}