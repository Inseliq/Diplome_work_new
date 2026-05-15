import React from 'react';
import { Link } from 'react-router-dom';
import { parseNotifyMarkdown } from '../../utils/parseNotifyMarkdown';

function NotificationPopup({ notification, onClose, visible }) {
  const { message, description } = notification;

  const rawBtn = notification['src-btn'];
  let btnLabel = null;
  let btnTo = null;

  if (rawBtn) {
    const colonIdx = rawBtn.indexOf(':');

    if (colonIdx !== -1) {
      btnLabel = rawBtn.slice(0, colonIdx).trim();
      btnTo = rawBtn.slice(colonIdx + 1).trim();
    }
  }

  const isExternal = btnTo?.startsWith('http');

  const nodes = parseNotifyMarkdown(description, {
    onNavigate: onClose,
  });

  return (
    <div
      className={`notify-popup${visible ? ' notify-popup--visible' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={message}
    >
      <div className="notify-popup__glow" />

      <div className="notify-popup__header">
        <div className="notify-popup__header-left">
          <span className="notify-popup__dot" />
          <span className="notify-popup__label">Уведомление</span>
        </div>

        <button className="notify-popup__close" onClick={onClose} aria-label="Закрыть">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <h3 className="notify-popup__title">{message}</h3>

      {nodes && (
        <div className="notify-popup__body notify-md">
          {nodes}
        </div>
      )}

      <div className="notify-popup__actions">
        {btnLabel && btnTo && (
          isExternal ? (
            <a
              href={btnTo}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm notify-popup__action-btn"
              onClick={onClose}
            >
              {btnLabel}
            </a>
          ) : (
            <Link
              to={btnTo}
              className="btn btn-primary btn-sm notify-popup__action-btn"
              onClick={onClose}
            >
              {btnLabel}
            </Link>
          )
        )}

        <button className="btn btn-ghost btn-sm notify-popup__dismiss" onClick={onClose}>
          Понятно
        </button>
      </div>
    </div>
  );
}

export default NotificationPopup;