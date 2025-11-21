import { useState, useCallback } from 'react';

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export const useSwipe = ({ onSwipeLeft, onSwipeRight, threshold = 50 }: SwipeOptions) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = useState<number | null>(null);

  const handleSwipe = useCallback((start: number, end: number) => {
    if (!start || !end) return;
    
    const distance = start - end;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  }, [threshold, onSwipeLeft, onSwipeRight]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (touchStart && touchEnd) {
      handleSwipe(touchStart, touchEnd);
    }
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, handleSwipe]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setMouseEnd(null);
    setMouseStart(e.clientX);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (mouseStart !== null) {
      setMouseEnd(e.clientX);
    }
  }, [mouseStart]);

  const onMouseUp = useCallback(() => {
    if (mouseStart && mouseEnd) {
      handleSwipe(mouseStart, mouseEnd);
    }
    setMouseStart(null);
    setMouseEnd(null);
  }, [mouseStart, mouseEnd, handleSwipe]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
    onMouseMove,
    onMouseUp
  };
};
