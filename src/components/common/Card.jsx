import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  onClick,
  padding = 'p-6',
}) => {
  const baseClasses = 'rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] transition-all duration-150';
  const hoverClasses = hover ? 'hover:border-[var(--line-strong)] hover:shadow-xs cursor-pointer' : '';
  
  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${padding} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
