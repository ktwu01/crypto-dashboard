import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  glow?: boolean;
  elevated?: boolean;
  bordered?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  gradient = false,
  glow = false,
  elevated = false,
  bordered = true
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2, scale: 1.005 } : {}}
      className={cn(
        // Base glass morphism styles with improved contrast
        'backdrop-blur-glass bg-glass-white',
        // Enhanced border visibility
        bordered && 'border border-glass-border',
        'rounded-xl',
        // Improved shadows
        elevated ? 'shadow-elevated' : 'shadow-section',
        'shadow-glass-inset',
        // Gradient overlay if requested
        gradient && 'bg-gradient-to-br from-glass-white to-white/5',
        // Glow effect if requested
        glow && 'shadow-neon-blue',
        // Enhanced transition for smooth animations
        'transition-all duration-300 ease-out',
        // Better visual hierarchy
        'relative overflow-hidden',
        className
      )}
    >
      {/* Optional subtle background pattern */}
      {elevated && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;