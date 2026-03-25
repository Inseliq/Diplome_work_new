import { useState, useEffect } from 'react';
import { getEvents } from '../../api/endpoints';
import { EVENTS_LIST_FALLBACK } from '../data/fallbacks';
import { logger } from '../utils/logger';

/**
 * Хук для списка событий (без поля content).
 *
 * @returns {{ events, loading, error, isFallback }}
 */
export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    setIsFallback(false);

    getEvents()
      .then((data) => {
        if (cancelled) return;
        setEvents(data);
      })
      .catch((err) => {
        if (cancelled) return;
        logger.warn('useEvents: API недоступен, загружаем заглушки', err);
        setEvents(EVENTS_LIST_FALLBACK);
        setError(err);
        setIsFallback(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { events, loading, error, isFallback };
}