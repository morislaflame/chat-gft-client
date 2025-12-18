import React from 'react';
import Button from '@/components/CoreComponents/Button';

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
      variant="secondary"
      className="w-40 h-10 rounded-lg flex items-center justify-center"
    >
      {isLoading ? 'Loading...' : label}
    </Button>
  );
};

export default RouletteButton;

