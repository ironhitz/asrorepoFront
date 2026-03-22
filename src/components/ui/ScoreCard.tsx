import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type CardColorType = 'orange' | 'purple' | 'emerald' | 'red' | 'blue';

interface ScoreCardProps {
  title: string;
  score: number | string;
  max?: number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  color?: CardColorType;
  subtitle?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

/**
 * Reusable score card component for displaying metrics
 * Supports trend indicators, color variants, and click handlers
 */
export function ScoreCard({
  title,
  score,
  max = 100,
  trend,
  trendValue = 0,
  color = 'orange',
  subtitle,
  icon,
  onClick,
}: ScoreCardProps) {
  const getColorClasses = (c: CardColorType) => {
    const colorMap = {
      orange: {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        text: 'text-orange-400',
        bar: 'bg-orange-500',
      },
      purple: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        text: 'text-purple-400',
        bar: 'bg-purple-500',
      },
      emerald: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        text: 'text-emerald-400',
        bar: 'bg-emerald-500',
      },
      red: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        text: 'text-red-400',
        bar: 'bg-red-500',
      },
      blue: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        bar: 'bg-blue-500',
      },
    };
    return colorMap[c];
  };

  const colorClasses = getColorClasses(color);
  const percentage = typeof score === 'number' ? (score / max) * 100 : 0;

  const getTrendIcon = () => {
    if (trend === 'up')
      return <TrendingUp size={16} className="text-emerald-400" />;
    if (trend === 'down') return <TrendingDown size={16} className="text-red-400" />;
    return <Minus size={16} className="text-zinc-500" />;
  };

  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-2xl border transition-all duration-300 ${colorClasses.bg} ${colorClasses.border} ${
        onClick ? 'cursor-pointer hover:border-opacity-100 hover:bg-opacity-20' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-zinc-400 mb-1">{title}</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-white">
              {typeof score === 'number' ? Math.round(score) : score}
            </h3>
            {max && typeof score === 'number' && (
              <span className="text-sm text-zinc-500">/{max}</span>
            )}
          </div>
        </div>
        {icon && <div className={colorClasses.text}>{icon}</div>}
      </div>

      {/* Subtitle */}
      {subtitle && <p className="text-xs text-zinc-500 mb-4">{subtitle}</p>}

      {/* Progress Bar */}
      {typeof score === 'number' && max > 0 && (
        <div className="mb-3">
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full ${colorClasses.bar} transition-all duration-500`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Trend Indicator */}
      {trend && (
        <div className="flex items-center gap-2 text-xs">
          {getTrendIcon()}
          <span className={trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-zinc-500'}>
            {trend === 'up' && '+'}
            {trendValue}% {trend === 'stable' && 'Stable'}
          </span>
        </div>
      )}
    </div>
  );
}
