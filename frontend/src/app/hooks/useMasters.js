import { useState, useEffect } from 'react';
import { getMasters } from '../../api/endpoints';
import { logger } from '../utils/logger';

export function useMasters() {
  const [tanks, setTanks] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadMasters() {
    setLoading(true);
    setError(null);

    try {
      const response = await getMasters();

      setTanks(response.tanks || []);
      setUpdatedAt(response.updated_at_utc || null);

      logger.info(`useMasters: загружено ${response.tanks?.length || 0} танков`);
    } catch (err) {
      logger.warn('useMasters: не удалось загрузить данные с backend', err);

      setTanks([]);
      setUpdatedAt(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMasters();
  }, []);

  return {
    tanks,
    updatedAt,
    loading,
    error,
    reload: loadMasters,
  };
}