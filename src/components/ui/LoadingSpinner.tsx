import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullscreen?: boolean;
  message?: string;
}

/**
 * Loading spinner component
 * Can be fullscreen overlay or inline spinner
 */
export function LoadingSpinner({
  size = 'medium',
  fullscreen = false,
  message = 'Loading...',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const spinner = (
    <div className={`${sizeClasses[size]} relative`}>
      {/* Outer ring gradient */}
      <div
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 border-r-purple-500 animate-spin"
        style={{
          animationDuration: '3s',
        }}
      />
      {/* Inner ring */}
      <div
        className="absolute inset-2 rounded-full border border-white/10 animate-spin"
        style={{
          animationDuration: '6s',
          animationDirection: 'reverse',
        }}
      />
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        {spinner}
        {message && <p className="mt-4 text-white text-sm">{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {spinner}
      {message && <p className="text-sm text-zinc-400">{message}</p>}
    </div>
  );
}
