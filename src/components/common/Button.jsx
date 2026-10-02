import React from 'react';

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled,
  className = '',
  icon,
  fullWidth = false,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-mono font-semibold tracking-tight rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-zinc-950 cursor-pointer select-none';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50 focus:ring-indigo-500 shadow-xs active:translate-y-0.5',
    secondary: 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300/80 dark:border-zinc-700 focus:ring-zinc-400 active:translate-y-0.5',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/50 focus:ring-emerald-500 shadow-xs active:translate-y-0.5',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-500/50 focus:ring-rose-500 shadow-xs active:translate-y-0.5',
    ghost: 'bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 border border-transparent',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs sm:text-sm',
    lg: 'px-6 py-2.5 text-sm sm:text-base',
  };
  
  const classes = [
    baseClasses,
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    fullWidth ? 'w-full' : '',
    disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
    className,
  ].join(' ');

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className={`mr-2 ${children ? '' : 'mr-0'}`}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
