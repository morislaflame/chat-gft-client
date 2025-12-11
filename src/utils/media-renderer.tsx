import React, { useState, useEffect } from "react";
import VisibleLottie from "./visible-lottie";
import pepeZaglushkaAnimation from '@/assets/PepeZaglushka.json';

interface MediaRendererProps {
  mediaFile?: {
    url: string;
    mimeType: string;
  } | null;
  imageUrl?: string | null;
  animations: { [url: string]: Record<string, unknown> };
  name?: string;
  className?: string;
  loop?: boolean;
  isLoading?: boolean;
}

// Универсальный компонент для отображения медиа (изображения или Lottie-анимации)
export const MediaRenderer: React.FC<MediaRendererProps> = ({
  mediaFile,
  imageUrl,
  animations,
  name = "",
  className = "",
  loop = false,
}) => {
  const [itemLoaded, setItemLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Если это Lottie-анимация, проверяем загружена ли она
    if (mediaFile && mediaFile.mimeType === 'application/json') {
      setItemLoaded(!!animations[mediaFile.url]);
    }
  }, [mediaFile, animations]);

  // Обработчик загрузки изображения
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Показываем заглушку только если элемент еще не загружен
  if (mediaFile && mediaFile.mimeType === 'application/json' && !itemLoaded) {
    return (
      <VisibleLottie
        animationData={pepeZaglushkaAnimation}
        className={className}
        loop={false}
      />
    );
  }

  if (mediaFile) {
    const { url, mimeType } = mediaFile;
    
    if (mimeType === 'application/json' && animations[url]) {
      return (
        <VisibleLottie
          animationData={animations[url]}
          className={className}
          loop={loop}
        />
      );
    } else if (mimeType.startsWith('image/')) {
      return (
        <>
          {!imageLoaded && (
            <VisibleLottie
              animationData={pepeZaglushkaAnimation}
              className={className}
              loop={false}
            />
          )}
          <img 
            src={url} 
            alt={name} 
            className={`${className} ${!imageLoaded ? 'hidden' : ''}`} 
            onLoad={handleImageLoad}
          />
        </>
      );
    }
  } 
  
  if (imageUrl) {
    return (
      <>
        {!imageLoaded && (
          <VisibleLottie
            animationData={pepeZaglushkaAnimation}
            className={className}
            loop={false}
          />
        )}
        <img 
          src={imageUrl} 
          alt={name} 
          className={`${className} ${!imageLoaded ? 'hidden' : ''}`} 
          onLoad={handleImageLoad}
        />
      </>
    );
  }
  
  // Запасное изображение, если ничего не найдено
  // return <img src={tokenImg} alt="Default image" className={className} />;
};

export default MediaRenderer;