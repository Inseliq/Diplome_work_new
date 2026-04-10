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
    let obs;

    const initObserver = () => {
      const targets = document.querySelectorAll('.reveal:not(.reveal--visible)');
      if (!targets.length) return;

      obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('reveal--visible');
              obs.unobserve(e.target);
            }
          });
        },
        {
          threshold: 0.05,
          rootMargin: '0px 0px -20px 0px',
        }
      );

      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.classList.add('reveal--visible');
        } else {
          obs.observe(el);
        }
      });
    };

    // 🔥 следим за изменениями DOM
    const mutationObserver = new MutationObserver(() => {
      initObserver();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // первый запуск
    setTimeout(initObserver, 100);

    return () => {
      if (obs) obs.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);
}