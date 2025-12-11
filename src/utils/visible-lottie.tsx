import React, { useEffect, useRef, useState } from "react";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";

interface VisibleLottieProps {
  animationData: any;
  className?: string;
  loop?: boolean;
}

// Компонент для Lottie-анимаций, который запускает воспроизведение только когда видим
export const VisibleLottie: React.FC<VisibleLottieProps> = ({ 
  animationData, 
  className,
  loop = false 
}) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      }, 
      { threshold: 0.2 } // Элемент считается видимым, если хотя бы 20% его площади видны
    );
    
    observer.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);
  
  // Управление воспроизведением анимации
  useEffect(() => {
    if (!lottieRef.current) return;
    
    if (isVisible) {
      lottieRef.current.play();
    } else {
      lottieRef.current.pause();
    }
  }, [isVisible]);
  
  return (
    <div ref={containerRef} className="w-full h-full flex justify-center items-center">
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={false} // Изначально анимация остановлена
        className={className}
      />
    </div>
  );
};

export default VisibleLottie;