import { useEffect, useState } from 'react';
import {
  getCustomTournaments,
  getCustomTournamentById,
} from '../../api/endpoints';
import { CUSTOMS_DATA } from '../data/customsData';
import { logger } from '../utils/logger';

export function useCustomTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    setIsFallback(false);

    getCustomTournaments()
      .then((data) => {
        if (cancelled) return;
        setTournaments(data);
      })
      .catch((err) => {
        if (cancelled) return;
        logger.warn('useCustomTournaments: API недоступен, загружаем заглушки', err);
        setTournaments(CUSTOMS_DATA);
        setError(err);
        setIsFallback(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { tournaments, loading, error, isFallback };
}

export function useCustomTournamentDetail(id) {
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    setLoading(true);
    setError(null);
    setIsFallback(false);
    setTournament(null);

    getCustomTournamentById(id)
      .then((data) => {
        if (cancelled) return;
        setTournament(data);
      })
      .catch((err) => {
        if (cancelled) return;
        logger.warn(`useCustomTournamentDetail(${id}): API недоступен`, err);
        const fallback = CUSTOMS_DATA.find((x) => x.id === Number(id)) ?? null;
        setTournament(fallback);
        setError(err);
        setIsFallback(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { tournament, loading, error, isFallback };
}