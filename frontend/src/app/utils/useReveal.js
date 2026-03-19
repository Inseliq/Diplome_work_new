import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Подключается один раз в Layout.
 * При каждом переходе заново ищет все .reveal на странице
 * и навешивает IntersectionObserver.
 */
export function useReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Небольшая задержка — дать React отрендерить новую страницу
    const timer = setTimeout(() => {
      const targets = document.querySelectorAll('.reveal:not(.reveal--visible)');

      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('reveal--visible');
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
      );

      targets.forEach((t) => obs.observe(t));

      return () => obs.disconnect();
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]); // перезапускаем при каждом переходе
}