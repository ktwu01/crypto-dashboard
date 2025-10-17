import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
  strokeWidth?: number;
}

const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = 'md',
  variant = 'default',
  className = '',
  strokeWidth = 2,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const variantClasses = {
    default: 'text-text-secondary',
    success: 'text-crypto-green',
    danger: 'text-crypto-red',
    warning: 'text-crypto-bitcoin',
    info: 'text-primary-400',
  };

  return (
    <IconComponent
      className={cn(
        sizeClasses[size],
        variantClasses[variant],
        'transition-colors duration-200',
        className
      )}
      strokeWidth={strokeWidth}
    />
  );
};

export default Icon;