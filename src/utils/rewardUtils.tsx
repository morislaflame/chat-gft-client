import React from 'react';
import Lottie from 'lottie-react';
import type { Reward } from '@/http/rewardAPI';

interface RenderRewardMediaOptions {
  reward: Reward;
  animationData?: Record<string, unknown> | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  containerClassName?: string;
}

const sizeConfig = {
  sm: { width: 80, height: 80, iconSize: 'text-2xl', containerSize: 'w-20 h-20' },
  md: { width: 96, height: 96, iconSize: 'text-3xl', containerSize: 'w-24 h-24' },
  lg: { width: 120, height: 120, iconSize: 'text-4xl', containerSize: 'w-[120px] h-[120px]' }
};

export const renderRewardMedia = ({
  reward,
  animationData = null,
  size = 'sm',
  className = '',
  containerClassName = ''
}: RenderRewardMediaOptions): React.ReactElement => {
  const config = sizeConfig[size];
  const mediaFile = reward.mediaFile;

  if (!mediaFile) {
    return (
      <div className={`${config.containerSize} bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center ${containerClassName}`}>
        <i className={`fas fa-gift text-white ${config.iconSize}`}></i>
      </div>
    );
  }

  const { url, mimeType } = mediaFile;

  // Lottie анимация
  if (mimeType === 'application/json' && animationData) {
    return (
      <div className={`${config.containerSize} flex items-center justify-center ${containerClassName}`}>
        <Lottie
          animationData={animationData}
          loop={false}
          autoplay={true}
          style={{ width: config.width, height: config.height }}
        />
      </div>
    );
  }

  // Изображение
  if (mimeType.startsWith('image/')) {
    return (
      <img
        src={url}
        alt={reward.name}
        className={`${config.containerSize} object-cover rounded-lg ${className}`}
      />
    );
  }

  // Дефолтная иконка
  return (
    <div className={`${config.containerSize} bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center ${containerClassName}`}>
      <i className={`fas fa-gift text-white ${config.iconSize}`}></i>
    </div>
  );
};

