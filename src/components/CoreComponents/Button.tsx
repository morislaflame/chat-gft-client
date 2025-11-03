import React, { type ReactNode } from 'react';
import { motion } from 'motion/react';

type ButtonVariant = 'primary' | 'secondary' | 'success';
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
  const variantClasses = {
    primary: 'bg-primary-700 hover:bg-primary-600 text-white',
    secondary: 'bg-secondary-500 hover:bg-secondary-400 text-white',
    success: 'bg-green-500 hover:bg-green-500 text-white',
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
    rounded-lg font-medium transition-colors cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `;

  const iconElement = icon ? (
    <i className={`${icon} ${iconSizeClasses[size]}`}></i>
  ) : null;

  // Если нет children, но есть иконка, показываем только иконку
  const hasContent = children || icon;

  return (
    <motion.button
      type={type}
      onClick={onClick}
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

