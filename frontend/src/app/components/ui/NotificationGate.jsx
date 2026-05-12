import React, { useState, useEffect } from 'react';
import NotificationPopup from './NotificationPopup';
import { NOTIFICATION } from '../../data/notifyData';
import { logger } from '../../utils/logger';

const SESSION_KEY = 'notify_seen_id';
const SHOW_DELAY = 1200; // мс после загрузки страницы

/**
 * Загружает уведомление.
 * Сначала пробуем /api/notification/latest, при ошибке — из notifyData.js
 */
async function fetchNotification() {
  try {
    const res = await fetch('/api/notification/latest', {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data?.id) return data;
    throw new Error('empty response');
  } catch (err) {
    logger.warn('NotificationGate: API недоступен, используем notifyData.js', err);
    return NOTIFICATION;
  }
}

/**
 * NotificationGate — монтируется один раз в Layout.
 *
 * Логика:
 *  1. После загрузки страницы ждёт SHOW_DELAY мс
 *  2. Загружает уведомление (API или заглушка)
 *  3. Если notification.id уже есть в sessionStorage — не показывает
 *  4. Иначе показывает popup и сохраняет id в sessionStorage после закрытия
 */
function NotificationGate() {
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;

    // Ждём полной загрузки страницы
    const init = () => {
      timer = setTimeout(async () => {
        const notify = await fetchNotification();
        if (!notify?.id) return;

        const seenId = sessionStorage.getItem(SESSION_KEY);
        if (String(seenId) === String(notify.id)) return; // уже видели

        setNotification(notify);

        // небольшой микрозадержка для монтирования перед анимацией
        requestAnimationFrame(() => {
          document.body.style.overflow = "hidden";
          requestAnimationFrame(() => setVisible(true));
        });
      }, SHOW_DELAY);
    };

    if (document.readyState === 'complete') {
      init();
    } else {
      window.addEventListener('load', init);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', init);
    };
  }, []);

  const handleClose = () => {
    document.body.style.overflow = "";
    setVisible(false);
    if (notification?.id != null) {
      sessionStorage.setItem(SESSION_KEY, String(notification.id));
    }
    // убираем из DOM после анимации
    setTimeout(() => setNotification(null), 400);
  };

  if (!notification) return null;

  return (
    <>
      {/* Оверлей */}
      <div
        className={`notify-overlay${visible ? ' notify-overlay--visible' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <NotificationPopup
        notification={notification}
        onClose={handleClose}
        visible={visible}
      />
    </>
  );
}

export default NotificationGate;