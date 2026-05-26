import React, { useEffect, useRef } from 'react';
import Lottie, { type LottieRefCurrentProps } from "lottie-react";

interface RouletteLottieProps {
  animationData: Record<string, unknown>;
  className?: string;
  /** Зарезервировано для будущей логики; сейчас не используется напрямую,
   * т.к. запуск анимации привязан к моменту попадания центра айтема в центр зоны. */
  isSpinning: boolean;
}

/**
 * Lottie-анимация для приза в рулетке. Воспроизводится тогда, когда **центр айтема**
 * совпадает с центром `.roulette-center-target` (а не просто пересекается с ней).
 *
 * Реализация без поллинга:
 *  - В центре айтема стоит невидимая 1×1px метка (`markerRef`).
 *  - Через `IntersectionObserver` с `root: null` и динамическим `rootMargin`
 *    наблюдаем эту метку относительно узкой вертикальной полосы по центру
 *    `.roulette-center-target`. Когда метка пересекает полосу — центр айтема
 *    оказался в центре экрана, и мы запускаем анимацию.
 *
 * Браузер сам уведомляет о входе/выходе — никаких `setInterval` или
 * `getBoundingClientRect` на каждом кадре. При resize окна / изменении размера
 * центральной зоны observer пересоздаётся, чтобы `rootMargin` оставался актуальным.
 */
/** Ширина «полосы попадания» в центре зоны, в пикселях. Чем уже — тем точнее
 * срабатывание совпадает с моментом «центр айтема в центре экрана». */
const HIT_STRIP_WIDTH_PX = 4;

const RouletteLottie: React.FC<RouletteLottieProps> = ({
  animationData,
  className = '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isSpinning: _isSpinning,
}) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const marker = markerRef.current;
    const center = document.querySelector('.roulette-center-target') as HTMLElement | null;
    if (!marker || !center) return;

    let observer: IntersectionObserver | null = null;

    const computeRootMargin = (): string => {
      const rect = center.getBoundingClientRect();
      // Сводим root (viewport) к узкой вертикальной полосе шириной HIT_STRIP_WIDTH_PX
      // вокруг центра зоны. По вертикали используем bounds самой зоны.
      const centerX = rect.left + rect.width / 2;
      const stripLeft = centerX - HIT_STRIP_WIDTH_PX / 2;
      const stripRight = centerX + HIT_STRIP_WIDTH_PX / 2;
      const top = -Math.round(rect.top);
      const right = -Math.round(window.innerWidth - stripRight);
      const bottom = -Math.round(window.innerHeight - rect.bottom);
      const left = -Math.round(stripLeft);
      return `${top}px ${right}px ${bottom}px ${left}px`;
    };

    const setup = () => {
      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry?.isIntersecting) return;
          // Только «вход» в центральную полосу — запускаем анимацию с нуля.
          // Выход не обрабатываем: пусть анимация доиграет до конца.
          lottieRef.current?.goToAndPlay(0);
        },
        {
          root: null,
          rootMargin: computeRootMargin(),
          threshold: 0,
        },
      );
      observer.observe(marker);
    };

    setup();

    const onResize = () => setup();
    window.addEventListener('resize', onResize);
    const ro = new ResizeObserver(setup);
    ro.observe(center);

    return () => {
      observer?.disconnect();
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay={false}
        className={className}
      />
      {/* Невидимая 1×1px метка ровно в центре айтема — IntersectionObserver следит за ней. */}
      <span
        ref={markerRef}
        aria-hidden
        className="pointer-events-none absolute"
        style={{ left: '40%', top: '50%', width: 1, height: 1 }}
      />
    </div>
  );
};

export default RouletteLottie;