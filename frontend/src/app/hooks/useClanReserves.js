import { useCallback, useEffect, useState } from 'react';
import {
  getClanReserves,
  activateClanReserve,
} from '../../api/endpoints';
import { logger } from '../utils/logger';

export function useClanReserves() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activatingType, setActivatingType] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getClanReserves();
      setState(data);
    } catch (err) {
      logger.warn('useClanReserves: не удалось загрузить резервы', err);
      setState(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const activate = useCallback(async (reserveType) => {
    setActivatingType(reserveType);
    setError(null);

    try {
      const data = await activateClanReserve(reserveType);
      setState(data);
    } catch (err) {
      logger.warn(`useClanReserves: не удалось активировать резерв ${reserveType}`, err);
      setError(err);
    } finally {
      setActivatingType(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError(null);

      try {
        const data = await getClanReserves();

        if (!cancelled) {
          setState(data);
        }
      } catch (err) {
        if (!cancelled) {
          logger.warn('useClanReserves: не удалось загрузить резервы', err);
          setState(null);
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    state,
    loading,
    error,
    activatingType,
    reload: load,
    activate,
  };
}