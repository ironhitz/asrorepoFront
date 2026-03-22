import React, { useMemo } from 'react';
import { TrendingUp, Calendar, Activity } from 'lucide-react';
import { useGitLabDashboardData } from '../hooks/useGitLabData';
import { ChartWrapper } from '../components/ui/ChartWrapper';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import {
  calculateScanStatistics,
  formatDate,
  formatNumber,
  calculateSecurityScore,
} from '../utils/metricCalculations';

/**
 * Analytics Page
 * Displays historical trends, scan history, and performance metrics
 * Security: Implements pagination and limits data exposure for large datasets
 */
export function AnalyticsPage() {
  const { scans, isLoading, error, lastUpdated } = useGitLabDashboardData();

  const statistics = useMemo(() => calculateScanStatistics(scans), [scans]);

  if (isLoading && scans.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Loading analytics data..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics & Trends</h1>
          <p className="text-zinc-400">Historical security metrics and performance insights</p>
        </div>
        {lastUpdated && (
          <div className="text-right">
            <p className="text-xs text-zinc-500 mb-1">Last Updated</p>
            <p className="text-sm text-zinc-300">{formatDate(lastUpdated)}</p>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-sm text-zinc-400 mb-2">Total Scans</p>
          <p className="text-3xl font-bold text-white">{statistics.totalScans}</p>
          <p className="text-xs text-zinc-500 mt-2">Lifetime scans</p>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-sm text-zinc-400 mb-2">Average Score</p>
          <p className="text-3xl font-bold text-white">{statistics.avgScore}</p>
          <p className="text-xs text-zinc-500 mt-2">of 100</p>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-sm text-zinc-400 mb-2">Peak Score</p>
          <p className="text-3xl font-bold text-emerald-400">{statistics.highestScore}</p>
          <p className="text-xs text-zinc-500 mt-2">Best performance</p>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-sm text-zinc-400 mb-2">Trend</p>
          <div className="flex items-center gap-2">
            {statistics.improvementTrend === 'up' && (
              <>
                <TrendingUp className="w-8 h-8 text-emerald-400" />
                <p className="text-lg font-bold text-emerald-400">Improving</p>
              </>
            )}
            {statistics.improvementTrend === 'down' && (
              <>
                <TrendingUp className="w-8 h-8 text-red-400 rotate-180" />
                <p className="text-lg font-bold text-red-400">Declining</p>
              </>
            )}
            {statistics.improvementTrend === 'stable' && (
              <>
                <Activity className="w-8 h-8 text-yellow-400" />
                <p className="text-lg font-bold text-yellow-400">Stable</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Score Trend Chart */}
      <ChartWrapper title="Security Score Trend" subtitle="Last 30 scans">
        {scans.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-zinc-500">No scan data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Simple Line Chart Visualization */}
            <div className="h-64 flex items-end gap-1 px-4 py-8 bg-white/5 rounded-lg overflow-x-auto">
              {scans.slice(-30).map((scan, idx) => {
                const score = calculateSecurityScore(scan);
                const height = (score / 100) * 100;
                return (
                  <div
                    key={idx}
                    className="flex-1 min-w-8 flex flex-col items-center group relative"
                  >
                    <div
                      className="w-full bg-gradient-to-t from-orange-500 to-purple-500 rounded-t-lg transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/50"
                      style={{ height: `${height}%`, minHeight: '2px' }}
                    />
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black/90 px-2 py-1 rounded text-xs text-white whitespace-nowrap transition-opacity z-10">
                      {score}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-zinc-400">Safe (80+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-zinc-400">Medium (40-79)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-zinc-400">At Risk (&lt;40)</span>
              </div>
            </div>
          </div>
        )}
      </ChartWrapper>

      {/* Scan History Table */}
      <ChartWrapper title="Scan History" subtitle={`${scans.length} scans recorded`}>
        {scans.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-zinc-500">No scan history available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Repository</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Scan Type</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Score</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Issues</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {scans.slice(0, 10).map((scan, idx) => {
                  const score = calculateSecurityScore(scan);
                  return (
                    <tr
                      key={idx}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4 text-white">{formatDate(scan.timestamp)}</td>
                      <td className="py-3 px-4 text-zinc-300">{scan.repository_name || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="info"
                          label={scan.scan_type.toUpperCase()}
                          size="small"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${score >= 80 ? 'text-emerald-400' : score >= 40 ? 'text-orange-400' : 'text-red-400'}`}>
                          {score}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white">{scan.summary?.total_issues || 0}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={scan.passed ? 'success' : 'error'}
                          label={scan.passed ? 'PASSED' : 'FAILED'}
                          size="small"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ChartWrapper>

      {/* Performance Metrics */}
      <ChartWrapper title="Scan Performance" subtitle="Scanning efficiency metrics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              label: 'Average Scan Duration',
              value: scans.length > 0 ? Math.round(
                scans.reduce((acc, s) => acc + (s.metrics?.scan_duration_ms || 0), 0) / scans.length
              ) : 0,
              unit: 'ms',
            },
            {
              label: 'Total Files Scanned',
              value: scans.length > 0 ? scans.reduce((acc, s) => acc + (s.metrics?.files_scanned || 0), 0) : 0,
              unit: '',
            },
            {
              label: 'Total Secrets Found',
              value: scans.length > 0 ? scans.reduce((acc, s) => acc + (s.metrics?.secrets_found || 0), 0) : 0,
              unit: '',
            },
          ].map((metric, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">
                {metric.label}
              </p>
              <p className="text-2xl font-bold text-white">
                {formatNumber(metric.value)}
                <span className="text-sm text-zinc-500 ml-1">{metric.unit}</span>
              </p>
            </div>
          ))}
        </div>
      </ChartWrapper>

      {/* Export Data (Placeholder) */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white mb-1">Export Analytics</h3>
            <p className="text-sm text-zinc-400">Download historical data for reporting</p>
          </div>
          <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium">
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
