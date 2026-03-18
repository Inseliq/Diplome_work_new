import { useState, useEffect, useRef, useCallback } from 'react';

function BannerSlider({ slides }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isDragging = useRef(false);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((p) => (p + 1) % slides.length);
    }, 5000);
  }, [slides.length]);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  const goTo = useCallback((idx) => {
    setActive(idx);
    resetTimer();
  }, [resetTimer]);

  const prev = () => goTo((active - 1 + slides.length) % slides.length);
  const next = () => goTo((active + 1) % slides.length);

  /* touch */
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };
  const onTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy && dx > 8) { isDragging.current = true; e.preventDefault(); }
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (isDragging.current && Math.abs(dx) > 40) dx < 0 ? next() : prev();
    touchStartX.current = null;
    touchStartY.current = null;
    isDragging.current = false;
  };

  return (
    <div className="banner-slider">

      {/* ── Row: [стрелка] [трек] [стрелка] ── */}
      <div className="banner-slider__row">

        <button
          className="banner-slider__arrow banner-slider__arrow--prev"
          onClick={prev}
          aria-label="Предыдущий слайд"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* ── Track: все слайды в одну grid-ячейку ── */}
        <div
          className="banner-slider__track"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`banner-slider__slide${i === active ? ' banner-slider__slide--active' : ''}`}
              aria-hidden={i !== active}
            >
              <div className="banner-slider__bg" style={{ background: slide.bgGradient }}>
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
                <h3 className="banner-slider__title">{slide.title}</h3>
                <p className="banner-slider__desc">{slide.desc}</p>
                {slide.btnLabel && (
                  <a href={slide.btnHref} className="btn btn-primary banner-slider__btn">
                    {slide.btnLabel}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          className="banner-slider__arrow banner-slider__arrow--next"
          onClick={next}
          aria-label="Следующий слайд"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

      </div>

      {/* ── Pagination ── */}
      <div className="banner-slider__pagination">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`banner-slider__dot${i === active ? ' banner-slider__dot--active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Слайд ${i + 1}`}
          />
        ))}
      </div>

    </div>
  );
}

export default BannerSlider;