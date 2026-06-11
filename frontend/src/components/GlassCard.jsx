import React from 'react';

const GlassCard = ({ 
  children, 
  className = '', 
  padding = '1.5rem', 
  hoverEffect = true,
  glow = false,
  glowColor = 'purple', // purple, cyan, pink
  ...props 
}) => {
  const glowClass = glow ? `shadow-glow-${glowColor}` : '';
  
  return (
    <div 
      className={`glass-panel ${className} ${glowClass}`} 
      style={{ 
        padding,
        animation: 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }} 
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
