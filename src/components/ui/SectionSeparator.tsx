import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionSeparatorProps {
  className?: string;
  variant?: 'line' | 'gradient' | 'dots';
  spacing?: 'sm' | 'md' | 'lg';
  withLabel?: string;
}

const SectionSeparator: React.FC<SectionSeparatorProps> = ({
  className = '',
  variant = 'gradient',
  spacing = 'md',
  withLabel,
}) => {
  const spacingClasses = {
    sm: 'my-6',
    md: 'my-8',
    lg: 'my-12',
  };

  const renderSeparator = () => {
    switch (variant) {
      case 'line':
        return (
          <div className="h-px bg-glass-border w-full" />
        );
      
      case 'gradient':
        return (
          <div className="h-px bg-section-separator w-full" />
        );
      
      case 'dots':
        return (
          <div className="flex items-center justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-text-muted rounded-full"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        );
      
      default:
        return (
          <div className="h-px bg-section-separator w-full" />
        );
    }
  };

  if (withLabel) {
    return (
      <div className={cn(
        'flex items-center',
        spacingClasses[spacing],
        className
      )}>
        <div className="flex-1">{renderSeparator()}</div>
        <div className="px-4">
          <span className="text-text-tertiary text-sm font-medium bg-dark-900/50 px-3 py-1 rounded-full backdrop-blur-sm">
            {withLabel}
          </span>
        </div>
        <div className="flex-1">{renderSeparator()}</div>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex items-center',
      spacingClasses[spacing],
      className
    )}>
      {renderSeparator()}
    </div>
  );
};

export default SectionSeparator;