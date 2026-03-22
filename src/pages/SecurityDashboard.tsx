import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useGitLabDashboardData } from '../hooks/useGitLabData';
import { ScoreCard } from '../components/ui/ScoreCard';
import { ChartWrapper } from '../components/ui/ChartWrapper';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  slideInFromLeft,
} from '../utils/animations';
import {
  calculateSecurityScore,
  getRiskLevel,
  getRiskColor,
  getVulnerabilityDistribution,
  formatDate,
  formatNumber,
  calculateTrend,
  truncateString,
} from '../utils/metricCalculations';

/**
 * SecurityDashboard Page
 * Displays security metrics, vulnerability distribution, and scan history
 * Security: Sanitizes all external data and uses React's built-in XSS protection
 */
export function SecurityDashboard() {
  const { latestScan, scans, isLoading, error, lastUpdated } = useGitLabDashboardData();

  if (isLoading && !latestScan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Loading security dashboard..." />
      </div>
    );
  }

  if (error && !latestScan) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-300 mb-1">Error Loading Dashboard</h3>
              <p className="text-sm text-red-200">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const currentScore = latestScan ? calculateSecurityScore(latestScan) : 0;
  const riskLevel = getRiskLevel(currentScore);
  const riskColor = getRiskColor(riskLevel);

  // Get previous scan for trend
  const previousScore = scans[1] ? calculateSecurityScore(scans[1]) : currentScore;
  const { trend, percentage: trendPercentage } = calculateTrend(currentScore, previousScore);

  // Get vulnerability distribution
  const vulnDistribution = getVulnerabilityDistribution(latestScan);

  // Get summary
  const summary = latestScan?.summary || {
    critical: 0,
    high: 0,
    medium: 0,
    total_issues: 0,
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        variants={slideInFromLeft}
        className="flex flex-col md:flex-row justify-between items-start gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Security Dashboard</h1>
          <p className="text-zinc-400">
            Real-time security metrics from{' '}
            <span className="text-orange-400">{latestScan?.repository_name || 'GitLab'}</span>
          </p>
        </div>
        {lastUpdated && (
          <div className="text-right">
            <p className="text-xs text-zinc-500 mb-1">Last Updated</p>
            <p className="text-sm text-zinc-300">{formatDate(lastUpdated)}</p>
          </div>
        )}
      </motion.div>

      {/* Main Metrics Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={staggerItem}>
          <ScoreCard
            title="Security Score"
            score={currentScore}
            max={100}
            color={riskColor === 'emerald' ? 'emerald' : riskColor === 'amber' ? 'blue' : riskColor === 'orange' ? 'orange' : 'red'}
            trend={trend}
            trendValue={trendPercentage}
            subtitle={`Risk: ${riskLevel.toUpperCase()}`}
            icon={<AlertTriangle size={20} />}
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <ScoreCard
            title="Critical Issues"
            score={summary.critical || 0}
            color="red"
            subtitle={summary.critical ? '⚠️ Requires attention' : '✓ None found'}
            icon={<AlertTriangle size={20} />}
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <ScoreCard
            title="High Severity"
            score={summary.high || 0}
            color="orange"
            subtitle={`${Math.round((summary.high / (summary.total_issues || 1)) * 100)}% of issues`}
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <ScoreCard
            title="Total Issues"
            score={summary.total_issues || 0}
            color="blue"
            subtitle={`Medium: ${summary.medium || 0}`}
          />
        </motion.div>
      </motion.div>

      {/* Risk Status */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Risk Level</h3>
            <Badge variant={riskLevel === 'safe' ? 'success' : riskLevel === 'low' ? 'info' : riskLevel === 'medium' ? 'warning' : 'error'} label={riskLevel.toUpperCase()} />
          </div>
          <p className="text-3xl font-bold text-white mb-2">{currentScore}</p>
          <p className="text-sm text-zinc-400">out of 100</p>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="font-semibold text-white mb-4">Scan Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Status</span>
              <Badge variant={latestScan?.passed ? 'success' : 'error'} label={latestScan?.passed ? 'PASSED' : 'FAILED'} />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Scan Type</span>
              <span className="text-white font-medium capitalize">{latestScan?.scan_type || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Branch</span>
              <span className="text-white font-medium">{latestScan?.branch || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="font-semibold text-white mb-4">Metrics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Files Scanned</span>
              <span className="text-white font-medium">{formatNumber(latestScan?.metrics?.files_scanned)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Secrets Found</span>
              <span className="text-white font-medium">{formatNumber(latestScan?.metrics?.secrets_found)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Scan Duration</span>
              <span className="text-white font-medium">
                {latestScan?.metrics?.scan_duration_ms ? `${latestScan.metrics.scan_duration_ms}ms` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Vulnerability Distribution */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        variants={fadeInUp}
        viewport={{ once: true }}
      >
        <ChartWrapper title="Vulnerability Distribution" subtitle="Issues by severity level">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Critical', value: vulnDistribution.critical, color: 'bg-red-500' },
            { label: 'High', value: vulnDistribution.high, color: 'bg-orange-500' },
            { label: 'Medium', value: vulnDistribution.medium, color: 'bg-amber-500' },
            { label: 'Low', value: vulnDistribution.low, color: 'bg-blue-500' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className={`${item.color} h-2 rounded-full mb-2 mx-auto w-full`} />
              <p className="text-sm font-semibold text-white">{item.value}</p>
              <p className="text-xs text-zinc-500">{item.label}</p>
            </div>
          ))}
        </div>
      </ChartWrapper>
      </motion.div>

      {/* Issues List */}
      {latestScan?.issues && latestScan.issues.length > 0 && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeInUp}
          viewport={{ once: true }}
        >
          <ChartWrapper title="Top Issues" subtitle={`Showing ${Math.min(5, latestScan.issues.length)} of ${latestScan.issues.length} issues`}>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {latestScan.issues.slice(0, 5).map((issue: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{truncateString(issue.title || issue.name || 'Unknown Issue', 60)}</p>
                    <p className="text-xs text-zinc-500 mt-1">{truncateString(issue.description || issue.file || 'No details', 80)}</p>
                  </div>
                  <Badge
                    variant={issue.severity === 'critical' ? 'error' : issue.severity === 'high' ? 'warning' : 'info'}
                    label={issue.severity?.toUpperCase() || 'INFO'}
                    size="small"
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartWrapper>
        </motion.div>
      )}

      {/* Recommendations */}
      {latestScan?.recommendations && latestScan.recommendations.length > 0 && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeInUp}
          viewport={{ once: true }}
        >
          <ChartWrapper title="Recommendations" subtitle="Suggested remediation steps">
          <div className="space-y-3">
            {latestScan.recommendations.slice(0, 5).map((rec: string, idx: number) => (
              <div key={idx} className="flex gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center text-xs text-blue-300 flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-sm text-zinc-300">{truncateString(rec, 120)}</p>
              </div>
            ))}
          </div>
        </ChartWrapper>
        </motion.div>
      )}
    </motion.div>
  );
}
