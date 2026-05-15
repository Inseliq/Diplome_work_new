import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Глобальный reveal.
 * Работает:
 * - при переходе между страницами;
 * - при появлении async-контента;
 * - при ручном событии window.dispatchEvent(new Event('app:reveal')).
 */
export function useReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add('reveal--visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px',
      }
    );

    const initReveal = () => {
      const targets = document.querySelectorAll('.reveal:not(.reveal--visible)');

      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();

        const isVisibleNow =
          rect.top < window.innerHeight &&
          rect.bottom > 0;

        if (isVisibleNow) {
          // важно: сначала браузер должен применить .reveal,
          // потом добавляем reveal--visible
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              el.classList.add('reveal--visible');
            });
          });
        } else {
          observer.observe(el);
        }
      });
    };

    const scheduleReveal = () => {
      requestAnimationFrame(() => {
        initReveal();
      });
    };

    const mutationObserver = new MutationObserver(() => {
      scheduleReveal();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window.addEventListener('app:reveal', scheduleReveal);

    const timeoutId = setTimeout(scheduleReveal, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('app:reveal', scheduleReveal);
    };
  }, [pathname]);
}