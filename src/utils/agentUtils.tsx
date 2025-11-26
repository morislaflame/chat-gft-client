import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import type { MediaFile } from '@/types/types';

interface AgentPreviewProps {
  preview: MediaFile | null | undefined;
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
  containerClassName?: string;
}

const sizeConfig = {
  sm: { width: 120, height: 120, iconSize: 'text-2xl', containerSize: 'w-[120px] h-[120px]' },
  md: { width: 200, height: 200, iconSize: 'text-3xl', containerSize: 'w-[200px] h-[200px]' },
  lg: { width: 300, height: 300, iconSize: 'text-4xl', containerSize: 'w-[300px] h-[300px]' },
  full: { width: '100%', height: 'auto', iconSize: 'text-4xl', containerSize: 'w-full' }
};

export const AgentPreview: React.FC<AgentPreviewProps> = ({
  preview,
  size = 'md',
  className = '',
  containerClassName = ''
}) => {
  const config = sizeConfig[size];
  const [animationData, setAnimationData] = useState<Record<string, unknown> | null>(null);

  // Загружаем JSON анимацию если это JSON файл
  useEffect(() => {
    if (preview?.mimeType === 'application/json' && preview.url) {
      fetch(preview.url)
        .then(response => response.json())
        .then(data => setAnimationData(data))
        .catch(error => {
          console.error('Error loading animation:', error);
          setAnimationData(null);
        });
    } else {
      setAnimationData(null);
    }
  }, [preview]);

  if (!preview || !preview.url) {
    return null;
  }

  const { url, mimeType } = preview;

  // Lottie анимация
  if (mimeType === 'application/json' && animationData) {
    return (
      <div className={`${config.containerSize} flex items-center justify-center ${containerClassName}`}>
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ 
            width: size === 'full' ? '100%' : config.width, 
            height: size === 'full' ? 'auto' : config.height 
          }}
        />
      </div>
    );
  }

  // Видео
  if (mimeType.startsWith('video/')) {
    return (
      <div className={`${config.containerSize} rounded-lg overflow-hidden ${containerClassName}`}>
        <video
          src={url}
          className={`w-full ${size === 'full' ? 'h-auto' : 'h-full'} object-cover ${className}`}
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
    );
  }

  // Изображение
  if (mimeType.startsWith('image/')) {
    return (
      <img
        src={url}
        alt="Agent preview"
        className={`${config.containerSize} ${size === 'full' ? 'h-auto' : ''} object-cover rounded-lg ${className}`}
      />
    );
  }

  // Если тип не поддерживается, не отображаем ничего
  return null;
};

