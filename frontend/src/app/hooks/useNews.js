import { useState, useEffect } from 'react';
import { getNews, getNewsById } from '../../api/endpoints';
import { NEWS_LIST_FALLBACK, NEWS_DETAIL_FALLBACK } from '../data/fallbacks';
import { logger } from '../utils/logger';

/**
 * Хук для списка новостей (без поля content).
 */
export function useNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    setIsFallback(false);

    getNews()
      .then((data) => {
        if (cancelled) return;
        setNews(data);
      })
      .catch((err) => {
        if (cancelled) return;
        logger.warn('useNews: API недоступен, загружаем заглушки', err);
        setNews(NEWS_LIST_FALLBACK);
        setError(err);
        setIsFallback(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { news, loading, error, isFallback };
}

/**
 * Хук для одной новости (с полем content).
 */
export function useNewsDetail(id) {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setLoading(true);
    setError(null);
    setIsFallback(false);
    setNews(null);

    getNewsById(id)
      .then((data) => {
        if (cancelled) return;
        setNews(data);
      })
      .catch((err) => {
        if (cancelled) return;
        logger.warn(`useNewsDetail(${id}): API недоступен, загружаем заглушку`, err);
        const fallback = NEWS_DETAIL_FALLBACK[Number(id)] ?? null;
        setNews(fallback);
        setError(err);
        setIsFallback(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  return { news, loading, error, isFallback };
}