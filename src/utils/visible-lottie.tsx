import React, { useEffect, useRef, useState } from "react";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";

interface VisibleLottieProps {
  animationData: Record<string, unknown>;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

// Компонент для Lottie-анимаций, который запускает воспроизведение только когда видим
export const VisibleLottie: React.FC<VisibleLottieProps> = ({ 
  animationData, 
  className,
  loop = false,
  autoplay = false,
}) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (autoplay) {
      // Force "visible" to start playing immediately in modals / non-lazy usage.
      setIsVisible(true);
      return;
    }
    if (!containerRef.current) return;
    const el = containerRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      }, 
      { threshold: 0.2 } // Элемент считается видимым, если хотя бы 20% его площади видны
    );
    
    observer.observe(el);
    
    return () => {
      observer.unobserve(el);
    };
  }, [autoplay]);
  
  // Управление воспроизведением анимации
  useEffect(() => {
    if (!isVisible) {
      lottieRef.current?.pause();
      return;
    }

    // Play on next frame to avoid being stuck on the first frame.
    const raf = requestAnimationFrame(() => {
      lottieRef.current?.play();
    });
    return () => cancelAnimationFrame(raf);
  }, [isVisible]);
  
  return (
    <div ref={containerRef} className={`${className ?? ""} flex justify-center items-center`}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        className="w-full h-full"
      />
    </div>
  );
};

export default VisibleLottie;