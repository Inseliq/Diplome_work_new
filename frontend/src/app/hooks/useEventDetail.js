import { useState, useEffect, useCallback } from 'react';
import { getEventById } from '../../api/endpoints';
import { logger } from '../utils/logger';

/**
 * Хук для одного события.
 *
 * Данные берутся только с backend.
 * Если backend недоступен — event будет null.
 */
export function useEventDetail(id) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEvent = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    setEvent(null);

    try {
      const data = await getEventById(id);

      setEvent(data ?? null);
    } catch (err) {
      logger.warn(`useEventDetail(${id}): не удалось загрузить событие`, err);

      setEvent(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) return;

      setLoading(true);
      setError(null);
      setEvent(null);

      try {
        const data = await getEventById(id);

        if (cancelled) return;

        setEvent(data ?? null);
      } catch (err) {
        if (cancelled) return;

        logger.warn(`useEventDetail(${id}): не удалось загрузить событие`, err);

        setEvent(null);
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
  }, [id]);

  return {
    event,
    loading,
    error,
    reload: loadEvent,
  };
}