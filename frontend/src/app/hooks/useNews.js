import { useState, useEffect, useCallback } from 'react';
import { getNews, getNewsById } from '../../api/endpoints';
import { logger } from '../utils/logger';

/**
 * Хук для списка новостей.
 *
 * Данные берутся только с backend.
 * Если backend недоступен — возвращается пустой массив.
 */
export function useNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getNews();

      setNews(Array.isArray(data) ? data : []);
    } catch (err) {
      logger.warn('useNews: не удалось загрузить новости с API', err);

      setNews([]);
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
        const data = await getNews();

        if (cancelled) return;

        setNews(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelled) return;

        logger.warn('useNews: не удалось загрузить новости с API', err);

        setNews([]);
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
    news,
    loading,
    error,
    reload: loadNews,
  };
}

/**
 * Хук для одной новости.
 *
 * Данные берутся только с backend.
 * Если backend недоступен — news будет null.
 */
export function useNewsDetail(id) {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNewsDetail = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    setNews(null);

    try {
      const data = await getNewsById(id);

      setNews(data ?? null);
    } catch (err) {
      logger.warn(`useNewsDetail(${id}): не удалось загрузить новость`, err);

      setNews(null);
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
      setNews(null);

      try {
        const data = await getNewsById(id);

        if (cancelled) return;

        setNews(data ?? null);
      } catch (err) {
        if (cancelled) return;

        logger.warn(`useNewsDetail(${id}): не удалось загрузить новость`, err);

        setNews(null);
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
    news,
    loading,
    error,
    reload: loadNewsDetail,
  };
}