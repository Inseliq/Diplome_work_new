import { useState, useEffect } from 'react';
import { getEventById } from '../../api/endpoints';
import { EVENTS_DETAIL_FALLBACK } from '../data/fallbacks';
import { logger } from '../utils/logger';

/**
 * Хук для одного события (с полем content).
 *
 * @param {number|string} id
 * @returns {{ event, loading, error, isFallback }}
 */
export function useEventDetail(id) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setLoading(true);
    setError(null);
    setIsFallback(false);
    setEvent(null);

    getEventById(id)
      .then((data) => {
        if (cancelled) return;
        setEvent(data);
      })
      .catch((err) => {
        if (cancelled) return;
        logger.warn(`useEventDetail(${id}): API недоступен, загружаем заглушку`, err);
        const fallback = EVENTS_DETAIL_FALLBACK[Number(id)] ?? null;
        setEvent(fallback);
        setError(err);
        setIsFallback(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  return { event, loading, error, isFallback };
}