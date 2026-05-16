import { useCallback, useEffect, useState } from 'react';
import {
  getMyClan,
  leaveClan,
} from '../../api/endpoints';
import { logger } from '../utils/logger';

export function useMyClan() {
  const [clan, setClan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClan = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getMyClan();
      setClan(data);
    } catch (err) {
      logger.warn('useMyClan: не удалось загрузить клан пользователя', err);
      setClan(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const leaveCurrentClan = useCallback(async () => {
    const result = await leaveClan();
    await loadClan();
    return result;
  }, [loadClan]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await getMyClan();

        if (!cancelled) {
          setClan(data);
        }
      } catch (err) {
        if (!cancelled) {
          logger.warn('useMyClan: не удалось загрузить клан пользователя', err);
          setClan(null);
          setError(err);
        }
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
    clan,
    loading,
    error,
    reload: loadClan,
    leaveCurrentClan,
  };
}