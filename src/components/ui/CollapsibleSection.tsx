import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  showIndicator?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = false,
  icon,
  className = '',
  headerClassName = '',
  contentClassName = '',
  showIndicator = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <button
        onClick={toggleExpanded}
        className={cn(
          'w-full flex items-center justify-between p-4 text-left',
          'text-text-primary hover:text-white transition-colors duration-200',
          'bg-glass-white hover:bg-white/10 border border-glass-border',
          'rounded-xl backdrop-blur-glass',
          'group focus:outline-none focus:ring-2 focus:ring-primary-500/50',
          headerClassName
        )}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="text-primary-400 group-hover:text-primary-300 transition-colors duration-200">
              {icon}
            </div>
          )}
          <span className="text-lg font-semibold">{title}</span>
        </div>
        
        {showIndicator && (
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="text-text-tertiary group-hover:text-text-secondary transition-colors duration-200"
          >
            <ChevronDown className="w-5 h-5" strokeWidth={2} />
          </motion.div>
        )}
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className={cn(
              'mt-2 p-4 rounded-xl',
              'bg-glass-white/50 border border-glass-border/50',
              'backdrop-blur-glass',
              contentClassName
            )}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollapsibleSection;