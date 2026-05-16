import { useEffect, useMemo, useState } from 'react';
import { getHomeBanners } from '../../api/endpoints';
import { logger } from '../utils/logger';

const DEFAULT_GRADIENT =
  'linear-gradient(135deg, #1a0540 0%, #2d0870 40%, #582BBA 100%)';

const DEFAULT_BANNER = {
  title: 'Добро пожаловать в CosmoManager',
  desc: 'CosmoManager — платформа для игроков и кланов Мира Танков: турниры, события, статистика, достижения, отметки, знаки классности и инструменты для управления сообществом.',
  btnLabel: 'Сервисы',
  btnHref: '/services',
  imageUrl: null,
  bgGradient: DEFAULT_GRADIENT,
};

function makeFallbackBanner(slot) {
  return {
    id: `fallback-${slot}`,
    slot,
    type: null,
    ...DEFAULT_BANNER,
  };
}

function normalizeBanner(item, slot) {
  if (!item) {
    return makeFallbackBanner(slot);
  }

  return {
    id: item.id ?? `banner-${slot}`,
    slot,
    type: null,
    title: item.title || DEFAULT_BANNER.title,
    desc: item.description || DEFAULT_BANNER.desc,
    btnLabel: item.buttonLabel || DEFAULT_BANNER.btnLabel,
    btnHref: item.buttonUrl || DEFAULT_BANNER.btnHref,
    imageUrl: item.imageUrl || null,
    bgGradient: item.gradient || DEFAULT_GRADIENT,
  };
}

export function useHomeBanners() {
  const [rawBanners, setRawBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await getHomeBanners();

        if (!cancelled) {
          setRawBanners(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        logger.warn('useHomeBanners: не удалось загрузить баннеры главной страницы', err);

        if (!cancelled) {
          setRawBanners([]);
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

  const banners = useMemo(() => {
    const banner1 = rawBanners.find((x) => Number(x.slot) === 1);
    const banner2 = rawBanners.find((x) => Number(x.slot) === 2);

    return {
      banner1Slides: [normalizeBanner(banner1, 1)],
      banner2Slides: [normalizeBanner(banner2, 2)],
    };
  }, [rawBanners]);

  return {
    ...banners,
    loading,
    error,
  };
}