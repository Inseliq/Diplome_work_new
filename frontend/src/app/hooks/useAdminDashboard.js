import { useEffect, useState, useCallback } from 'react';
import { getAdminDashboard } from '../../api/endpoints';
import { logger } from '../utils/logger';

export function useAdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminDashboard();
      setDashboard(data);
    } catch (err) {
      logger.warn('useAdminDashboard: не удалось загрузить админ-панель', err);
      setDashboard(null);
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
        const data = await getAdminDashboard();

        if (!cancelled) {
          setDashboard(data);
        }
      } catch (err) {
        if (!cancelled) {
          logger.warn('useAdminDashboard: не удалось загрузить админ-панель', err);
          setDashboard(null);
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
    dashboard,
    loading,
    error,
    reload: loadDashboard,
  };
}