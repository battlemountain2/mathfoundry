import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  onClick,
  padding = 'p-6',
}) => {
  const baseClasses = 'bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-all duration-150';
  const hoverClasses = hover ? 'hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs cursor-pointer' : '';
  
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
