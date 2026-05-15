import { useState, useEffect } from 'react';
import { getDirectoryVehicles } from '../../api/endpoints';
import { logger } from '../utils/logger';

export function useVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadVehicles() {
    setLoading(true);
    setError(null);

    try {
      const response = await getDirectoryVehicles();

      setVehicles(response.vehicles || []);

      logger.info(`useVehicles: загружено ${response.vehicles?.length || 0} машин`);
    } catch (err) {
      logger.warn('useVehicles: не удалось загрузить технику с backend', err);

      setVehicles([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  return {
    vehicles,
    loading,
    error,
    reload: loadVehicles
  };
}