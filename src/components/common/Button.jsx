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
  const baseClasses = 'inline-flex items-center justify-center font-sans font-semibold tracking-tight rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer select-none';
  
  const variants = {
    primary: 'bg-[var(--accent)] hover:opacity-90 text-white border border-[var(--accent)] shadow-xs active:translate-y-0.5',
    secondary: 'bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--line-strong)] active:translate-y-0.5',
    success: 'bg-[var(--good)] hover:opacity-90 text-white border border-[var(--good)] shadow-xs active:translate-y-0.5',
    danger: 'bg-[var(--heat)] hover:opacity-90 text-white border border-[var(--heat)] shadow-xs active:translate-y-0.5',
    ghost: 'bg-transparent text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] border border-transparent',
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
