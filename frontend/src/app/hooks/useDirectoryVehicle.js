import { useState, useEffect } from 'react';
import { getDirectoryVehicleById } from '../../api/endpoints';
import { logger } from '../utils/logger';

export function useDirectoryVehicle(id) {
  const [directoryVehicle, setDirectoryVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadDirectoryVehicle() {
    setLoading(true);
    setError(null);

    try {
      const response = await getDirectoryVehicleById(id);

      setDirectoryVehicle(response);

      logger.info(`useDirectoryVehicle: загружен танк ${id}`);
    } catch (err) {
      logger.warn(`useDirectoryVehicle: не удалось загрузить танк ${id}`, err);

      setDirectoryVehicle(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;

    loadDirectoryVehicle();
  }, [id]);

  return {
    directoryVehicle,
    loading,
    error,
    reload: loadDirectoryVehicle
  };
}