import { useState, useEffect, useCallback } from 'react';
import {
  getCustomTournaments,
  getCustomTournamentById,
} from '../../api/endpoints';
import { logger } from '../utils/logger';

export function useCustomTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getCustomTournaments();

      setTournaments(Array.isArray(data) ? data : []);
    } catch (err) {
      logger.warn('useCustomTournaments: не удалось загрузить турниры с API', err);

      setTournaments([]);
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
        const data = await getCustomTournaments();

        if (cancelled) return;

        setTournaments(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelled) return;

        logger.warn('useCustomTournaments: не удалось загрузить турниры с API', err);

        setTournaments([]);
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
    tournaments,
    loading,
    error,
    reload: loadTournaments,
  };
}

export function useCustomTournamentDetail(id) {
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTournament = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    setTournament(null);

    try {
      const data = await getCustomTournamentById(id);

      setTournament(data ?? null);
    } catch (err) {
      logger.warn(`useCustomTournamentDetail(${id}): не удалось загрузить турнир`, err);

      setTournament(null);
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
      setTournament(null);

      try {
        const data = await getCustomTournamentById(id);

        if (cancelled) return;

        setTournament(data ?? null);
      } catch (err) {
        if (cancelled) return;

        logger.warn(`useCustomTournamentDetail(${id}): не удалось загрузить турнир`, err);

        setTournament(null);
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
    tournament,
    loading,
    error,
    reload: loadTournament,
  };
}