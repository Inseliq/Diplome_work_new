import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

function getBackgroundStyle(slide) {
  if (slide.imageUrl) {
    return {
      backgroundImage: `linear-gradient(135deg, rgba(10, 5, 20, 0.45), rgba(10, 5, 20, 0.2)), url(${slide.imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  }

  return {
    background: slide.bgGradient,
  };
}

function isExternalLink(url) {
  return url?.startsWith('http://') || url?.startsWith('https://');
}

function BannerButton({ href, children }) {
  if (!href) return null;

  if (isExternalLink(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary banner-slider__btn"
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className="btn btn-primary banner-slider__btn">
      {children}
    </Link>
  );
}

function BannerSlider({ slides = [] }) {
  const safeSlides = Array.isArray(slides) ? slides.filter(Boolean) : [];
  const hasMultipleSlides = safeSlides.length > 1;

  const [active, setActive] = useState(0);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isDragging = useRef(false);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);

    if (!hasMultipleSlides) return;

    timerRef.current = setInterval(() => {
      setActive((previous) => (previous + 1) % safeSlides.length);
    }, 5000);
  }, [hasMultipleSlides, safeSlides.length]);

  useEffect(() => {
    if (active >= safeSlides.length) {
      setActive(0);
    }
  }, [active, safeSlides.length]);

  useEffect(() => {
    resetTimer();

    return () => {
      clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const goTo = useCallback((idx) => {
    if (!hasMultipleSlides) return;

    setActive(idx);
    resetTimer();
  }, [hasMultipleSlides, resetTimer]);

  const prev = () => {
    if (!hasMultipleSlides) return;
    goTo((active - 1 + safeSlides.length) % safeSlides.length);
  };

  const next = () => {
    if (!hasMultipleSlides) return;
    goTo((active + 1) % safeSlides.length);
  };

  const onTouchStart = (e) => {
    if (!hasMultipleSlides) return;

    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const onTouchMove = (e) => {
    if (!hasMultipleSlides) return;
    if (touchStartX.current === null) return;

    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);

    if (dx > dy && dx > 8) {
      isDragging.current = true;
      e.preventDefault();
    }
  };

  const onTouchEnd = (e) => {
    if (!hasMultipleSlides) return;
    if (touchStartX.current === null) return;

    const dx = e.changedTouches[0].clientX - touchStartX.current;

    if (isDragging.current && Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
    }

    touchStartX.current = null;
    touchStartY.current = null;
    isDragging.current = false;
  };

  if (safeSlides.length === 0) {
    return null;
  }

  return (
    <div className="banner-slider">
      <div className="banner-slider__row">
        {hasMultipleSlides && (
          <button
            className="banner-slider__arrow banner-slider__arrow--prev"
            onClick={prev}
            aria-label="Предыдущий слайд"
            type="button"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        <div
          className="banner-slider__track"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {safeSlides.map((slide, i) => (
            <div
              key={slide.id ?? i}
              className={`banner-slider__slide${i === active ? ' banner-slider__slide--active' : ''}`}
              aria-hidden={i !== active}
            >
              <div className="banner-slider__bg" style={getBackgroundStyle(slide)}>
                <div className="banner-slider__noise" />
              </div>

              <div className="banner-slider__content">
                {slide.type === 'event' && (
                  <span className="badge badge-event banner-slider__event-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Событие
                  </span>
                )}

                <h3 className="banner-slider__title">
                  {slide.title}
                </h3>

                <p className="banner-slider__desc">
                  {slide.desc}
                </p>

                {slide.btnLabel && (
                  <BannerButton href={slide.btnHref}>
                    {slide.btnLabel}

                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </BannerButton>
                )}
              </div>
            </div>
          ))}
        </div>

        {hasMultipleSlides && (
          <button
            className="banner-slider__arrow banner-slider__arrow--next"
            onClick={next}
            aria-label="Следующий слайд"
            type="button"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      {hasMultipleSlides && (
        <div className="banner-slider__pagination">
          {safeSlides.map((_, i) => (
            <button
              key={i}
              className={`banner-slider__dot${i === active ? ' banner-slider__dot--active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Слайд ${i + 1}`}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BannerSlider;