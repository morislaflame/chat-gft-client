import React, { useEffect, useRef, useState } from 'react';
import Lottie, { type LottieRefCurrentProps } from "lottie-react";

interface RouletteLottieProps {
  animationData: Record<string, unknown>;
  className?: string;
  isSpinning: boolean;
}

const RouletteLottie: React.FC<RouletteLottieProps> = ({ 
  animationData, 
  className = '',
  isSpinning
}) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInCenter, setIsInCenter] = useState(false);
  
  // Настройка observer для отслеживания когда элемент в центре
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Получаем элемент, по которому определяем центральную зону
    const centerElement = document.querySelector('.roulette-center-target');
    if (!centerElement) return;
    
    const checkIfInCenter = () => {
      // Получаем координаты элементов
      const centerRect = centerElement.getBoundingClientRect();
      const itemRect = containerRef.current?.getBoundingClientRect();
      
      if (!itemRect) return;
      
      // Проверяем, пересекается ли элемент с центральной зоной
      // Элемент считается в центре, если его центр находится в пределах центральной зоны
      const itemCenterX = itemRect.left + itemRect.width / 2;
      const isInCenterNow = 
        itemCenterX >= centerRect.left && 
        itemCenterX <= centerRect.right;
      
      // Обновляем состояние только если оно изменилось
      if (isInCenterNow !== isInCenter) {
        setIsInCenter(isInCenterNow);
      }
    };
    
    // Проверяем положение при монтировании и при скролле/изменении размеров
    checkIfInCenter();
    
    // Для рулетки нам нужно чаще проверять положение
    const intervalId = setInterval(checkIfInCenter, 1000);
    
    // Очистка при размонтировании
    return () => {
      clearInterval(intervalId);
    };
  }, [isInCenter]);
  
  // Управление воспроизведением анимации
  useEffect(() => {
    if (!lottieRef.current) return;
    
    // Воспроизводить только если элемент в центре И рулетка не крутится
    if (isInCenter && !isSpinning) {
      console.log('Playing animation');
      lottieRef.current.goToAndPlay(0);
    } else {
      lottieRef.current.stop();
    }
  }, [isInCenter, isSpinning]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay={false}
        className={className}
      />
    </div>
  );
};

export default RouletteLottie;