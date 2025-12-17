import React, { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { useHapticFeedback } from '@/utils/useHapticFeedback';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'tretiary' | 'default';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children?: ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  icon?: string;
  className?: string;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'secondary',
  size = 'md',
  disabled = false,
  icon,
  className = '',
  iconPosition = 'left',
}) => {
  const { hapticImpact } = useHapticFeedback();
  const variantClasses = {
    primary: 'bg-primary-700 hover:bg-primary-600 text-white shadow-lg',
    secondary: 'bg-secondary-500 hover:bg-secondary-400 text-white shadow-lg',
    tretiary: ' bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-lg',
    success: 'bg-green-500 hover:bg-green-500 text-white shadow-lg ',
    default: 'text-white hover:bg-white/10'
  };

  const sizeClasses = {
    sm: 'px-2.5 py-2 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const iconSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const baseClasses = `
    relative rounded-lg font-medium transition-all duration-200 cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
    border border-white/10
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
    before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-b before:from-white/20 before:to-transparent before:pointer-events-none
    active:before:opacity-50
  `;

  const iconElement = icon ? (
    <i className={`${icon} ${iconSizeClasses[size]}`}></i>
  ) : null;

  // Если нет children, но есть иконка, показываем только иконку
  const hasContent = children || icon;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.stopPropagation();
      hapticImpact('soft');
      onClick?.(e);
    }
  };

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.9 }}
      transition={{ duration: 0.2 }}
      className={baseClasses.trim()}
    >
      {hasContent && (
        <span className="flex items-center justify-center gap-2">
          {iconPosition === 'left' && iconElement}
          {children}
          {iconPosition === 'right' && iconElement}
        </span>
      )}
    </motion.button>
  );
};

export default Button;

