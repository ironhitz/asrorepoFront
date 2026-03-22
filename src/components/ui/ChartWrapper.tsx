import React from 'react';

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
}

/**
 * Wrapper component for chart visualizations
 * Provides consistent styling and loading/error states
 */
export function ChartWrapper({ title, subtitle, children, loading, error }: ChartWrapperProps) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 hover:border-white/20">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-zinc-500">Loading chart...</div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-400 text-sm">Error loading chart</p>
            <p className="text-zinc-500 text-xs mt-2">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && <div className="w-full">{children}</div>}
    </div>
  );
}
