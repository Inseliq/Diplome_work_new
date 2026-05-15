import React, { useState, useEffect } from 'react';
import NotificationPopup from './NotificationPopup';
import { getLatestNotification } from '../../../api/endpoints';
import { logger } from '../../utils/logger';

const SESSION_KEY = 'notify_seen_id';
const SHOW_DELAY = 1200;

async function fetchNotification() {
  try {
    const data = await getLatestNotification();

    if (data?.id) {
      return data;
    }

    return null;
  } catch (err) {
    logger.warn('NotificationGate: не удалось загрузить уведомление с API', err);
    return null;
  }
}

function NotificationGate() {
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;

    const init = () => {
      timer = setTimeout(async () => {
        const notify = await fetchNotification();

        if (!notify?.id) return;

        const seenId = sessionStorage.getItem(SESSION_KEY);

        if (String(seenId) === String(notify.id)) {
          return;
        }

        setNotification(notify);

        requestAnimationFrame(() => {
          document.body.style.overflow = 'hidden';

          requestAnimationFrame(() => {
            setVisible(true);
          });
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
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    document.body.style.overflow = '';
    setVisible(false);

    if (notification?.id != null) {
      sessionStorage.setItem(SESSION_KEY, String(notification.id));
    }

    setTimeout(() => {
      setNotification(null);
    }, 400);
  };

  if (!notification) return null;

  return (
    <>
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