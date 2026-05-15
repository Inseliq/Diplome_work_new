import { useState, useEffect } from 'react';
import { getMarks } from '../../api/endpoints';
import { logger } from '../utils/logger';

export function useMarks() {
  const [tanks, setTanks] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadMarks() {
    setLoading(true);
    setError(null);

    try {
      const response = await getMarks();

      setTanks(response.tanks || []);
      setUpdatedAt(response.updated_at_utc || null);

      logger.info(`useMarks: загружено ${response.tanks?.length || 0} танков`);
    } catch (err) {
      logger.warn('useMarks: не удалось загрузить данные с backend', err);

      setTanks([]);
      setUpdatedAt(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMarks();
  }, []);

  return {
    tanks,
    updatedAt,
    loading,
    error,
    reload: loadMarks
  };
}