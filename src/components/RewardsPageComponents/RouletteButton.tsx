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
      variant="gradient"
      className="w-40 h-10 rounded-lg flex items-center justify-center"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {label}
        </span>
      ) : (
        label
      )}
    </Button>
  );
};

export default RouletteButton;

