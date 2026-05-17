import { useEffect, useMemo, useState } from 'react';
import { getHomeBanners } from '../../api/endpoints';
import { logger } from '../utils/logger';

const DEFAULT_GRADIENT =
  'linear-gradient(135deg, #1a0540 0%, #582BBA 60%, #835de4 100%)';

const FALLBACK_SLIDE = {
  id: 'fallback',
  type: null,
  title: 'Добро пожаловать в CosmoManager',
  desc: 'CosmoManager — платформа для игроков и кланов Мира Танков: турниры, события, новости, сборки техники, достижения и удобные инструменты управления.',
  btnLabel: 'Сервисы',
  btnHref: '/services',
  imageUrl: null,
  bgGradient: DEFAULT_GRADIENT,
};

function toSlide(banner) {
  return {
    id: banner.id,
    type: null,
    title: banner.title,
    desc: banner.description,
    btnLabel: banner.buttonLabel,
    btnHref: banner.buttonUrl,
    imageUrl: banner.imageUrl,
    bgGradient: banner.gradient || DEFAULT_GRADIENT,
  };
}

function buildSlotSlides(banners, slot) {
  const slotSlides = banners
    .filter((banner) => Number(banner.slot) === Number(slot))
    .map(toSlide);

  if (slotSlides.length === 0) {
    return [
      {
        ...FALLBACK_SLIDE,
        id: `fallback-${slot}`,
      },
    ];
  }

  return slotSlides;
}

export function useHomeBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await getHomeBanners();

        if (cancelled) return;

        setBanners(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelled) return;

        logger.warn('useHomeBanners: не удалось загрузить баннеры', err);

        setBanners([]);
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

  const banner1Slides = useMemo(
    () => buildSlotSlides(banners, 1),
    [banners]
  );

  const banner2Slides = useMemo(
    () => buildSlotSlides(banners, 2),
    [banners]
  );

  return {
    banners,
    banner1Slides,
    banner2Slides,
    loading,
    error,
  };
}