import React, { useEffect, useRef, useState } from "react";
import { MediaRenderer } from './media-renderer';
import pepeZaglushkaAnimation from '@/assets/PepeZaglushka.json';
import VisibleLottie from "./visible-lottie";

interface LazyMediaRendererProps {
  mediaFile?: {
    url: string;
    mimeType: string;
  } | null;
  imageUrl?: string | null;
  animations: { [url: string]: Record<string, unknown> };
  name?: string;
  className?: string;
  loop?: boolean;
  loadOnIntersect?: boolean;
}

export const LazyMediaRenderer: React.FC<LazyMediaRendererProps> = ({
  mediaFile,
  imageUrl,
  animations,
  name = "",
  className = "",
  loop = false,
  loadOnIntersect = true
}) => {
  // const [_isVisible, setIsVisible] = useState(!loadOnIntersect);
  const [isIntersected, setIsIntersected] = useState(!loadOnIntersect);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current || !loadOnIntersect) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsIntersected(true);
          // Отключаем обсервер после первой интерсекции
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // Загружать когда элемент приближается на 100px к видимой области
      }
    );
    
    observer.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [loadOnIntersect]);
  
  return (
    <div ref={containerRef} className={className}>
      {isIntersected ? (
        <MediaRenderer
          mediaFile={mediaFile}
          imageUrl={imageUrl}
          animations={animations}
          name={name}
          className={className}
          loop={loop}
        />
      ) : (
        <VisibleLottie
          animationData={pepeZaglushkaAnimation}
          className={className}
          loop={false}
        />
      )}
    </div>
  );
};

export default LazyMediaRenderer;