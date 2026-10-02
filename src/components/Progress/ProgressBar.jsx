import React from 'react';

export const ProgressBar = ({ percentage = 0, color = 'indigo', size = 'md', showLabel = false }) => {
  const safePercentage = Math.min(100, Math.max(0, percentage));
  
  const colors = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };
  
  const bgColors = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30',
    amber: 'bg-amber-100 dark:bg-amber-900/30',
    rose: 'bg-rose-100 dark:bg-rose-900/30',
  };

  const sizes = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  const selectedColor = colors[color] || colors.indigo;
  const selectedBgColor = bgColors[color] || bgColors.indigo;
  const selectedSize = sizes[size] || sizes.md;

  return (
    <div className="w-full flex items-center">
      <div className={`w-full overflow-hidden rounded-full ${selectedBgColor}`}>
        <div 
          className={`${selectedColor} ${selectedSize} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${safePercentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="ml-4 text-sm font-bold text-slate-700 dark:text-slate-300 min-w-[3rem]">
          {Math.round(safePercentage)}%
        </span>
      )}
    </div>
  );
};
export default ProgressBar;
