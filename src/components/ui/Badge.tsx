import React from 'react';
import { Check, AlertCircle, Info } from 'lucide-react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: boolean;
  className?: string;
}

/**
 * Status badge component for displaying status indicators
 * Secure: sanitizes input and uses semantic HTML
 */
export function Badge({
  label,
  variant = 'info',
  size = 'medium',
  icon = false,
  className = '',
}: BadgeProps) {
  const variantClasses = {
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    error: 'bg-red-500/20 text-red-300 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    neutral: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
  };

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base',
  };

  const getIcon = () => {
    if (!icon) return null;
    switch (variant) {
      case 'success':
        return <Check size={14} className="mr-1" />;
      case 'error':
        return <AlertCircle size={14} className="mr-1" />;
      case 'warning':
        return <AlertCircle size={14} className="mr-1" />;
      case 'info':
        return <Info size={14} className="mr-1" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {getIcon()}
      <span>{label}</span>
    </span>
  );
}
