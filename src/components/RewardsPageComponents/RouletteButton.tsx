import React from 'react';
import Button from '@/components/ui/button';

type RouletteButtonProps = {
  onStart: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  label?: string;
};

const RouletteButton: React.FC<RouletteButtonProps> = ({
  onStart,
  disabled = false,
  isLoading = false,
  label = 'Open',
}) => {
  return (
    <Button
      onClick={() => onStart()}
      disabled={disabled || isLoading}
      variant={disabled ? 'default' : 'gradient'}
      size="default"
      state={isLoading ? 'loading' : 'default'}
      className="w-40 h-10 rounded-lg flex items-center justify-center"
    >
      {label}
    </Button>
  );
};

export default RouletteButton;

