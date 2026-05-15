import { useState, useEffect, useCallback } from 'react';
import { getEvents } from '../../api/endpoints';
import { logger } from '../utils/logger';

/**
 * Хук для списка событий.
 *
 * Данные берутся только с backend.
 * Если backend недоступен — возвращается пустой массив.
 */
export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getEvents();

      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      logger.warn('useEvents: не удалось загрузить события с API', err);

      setEvents([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await getEvents();

        if (cancelled) return;

        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelled) return;

        logger.warn('useEvents: не удалось загрузить события с API', err);

        setEvents([]);
        setError(err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    events,
    loading,
    error,
    reload: loadEvents,
  };
}