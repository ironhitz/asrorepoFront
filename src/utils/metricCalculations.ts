/**
 * Utility functions for metric calculations and data transformations
 * Security: All inputs are validated and sanitized
 */

import type { ScanData, ComplianceData } from '../services/gitlabDataService';

/**
 * Calculate overall security score from scan data
 * Accounts for different severity levels and issue counts
 */
export function calculateSecurityScore(scan: ScanData | null): number {
  if (!scan) return 0;

  const { summary } = scan;
  if (!summary) return scan.score || 0;

  // Base score calculation
  let score = 100;

  // Deduct based on critical issues (5 points each, max 50 points)
  score -= Math.min(summary.critical * 5, 50);

  // Deduct based on high severity (2 points each, max 30 points)
  score -= Math.min(summary.high * 2, 30);

  // Deduct based on medium severity (0.5 points each, max 15 points)
  score -= Math.min(summary.medium * 0.5, 15);

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Determine risk level based on score
 */
export function getRiskLevel(score: number): 'critical' | 'high' | 'medium' | 'low' | 'safe' {
  if (score >= 80) return 'safe';
  if (score >= 60) return 'low';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'high';
  return 'critical';
}

/**
 * Get color for risk level for UI display
 */
export function getRiskColor(riskLevel: ReturnType<typeof getRiskLevel>): 'emerald' | 'amber' | 'orange' | 'red' | 'blue' {
  const colorMap = {
    safe: 'emerald',
    low: 'amber',
    medium: 'orange',
    high: 'red',
    critical: 'red',
  } as const;
  return colorMap[riskLevel];
}

/**
 * Calculate trend percentage (compare two scans)
 */
export function calculateTrend(current: number, previous: number): {
  trend: 'up' | 'down' | 'stable';
  percentage: number;
} {
  if (previous === 0) {
    return { trend: 'stable', percentage: 0 };
  }

  const diff = current - previous;
  const percentage = Math.abs((diff / previous) * 100);
  const trend = diff > 2 ? 'up' : diff < -2 ? 'down' : 'stable';

  return { trend, percentage: Math.round(percentage) };
}

/**
 * Format date for display
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number | undefined): string {
  if (num === undefined || num === null) return '0';
  return num.toLocaleString();
}

/**
 * Get vulnerability distribution for charts
 */
export function getVulnerabilityDistribution(scan: ScanData | null) {
  if (!scan?.summary)
    return {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

  return {
    critical: scan.summary.critical || 0,
    high: scan.summary.high || 0,
    medium: scan.summary.medium || 0,
    low: (scan.summary.total_issues - (scan.summary.critical + scan.summary.high + scan.summary.medium)) || 0,
  };
}

/**
 * Calculate compliance score indicators
 */
export function getComplianceStatus(compliance: ComplianceData | null) {
  if (!compliance)
    return {
      score: 0,
      status: 'unknown' as const,
      issues: 0,
    };

  const status = compliance.passed ? 'passed' : 'failed';
  const issues = compliance.issues?.length || 0;

  return {
    score: Math.round(compliance.score || 0),
    status,
    issues,
  };
}

/**
 * Calculate days since last scan
 */
export function getDaysSinceScan(lastScanDate: string | undefined): number {
  if (!lastScanDate) return -1;
  try {
    const lastScan = new Date(lastScanDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastScan.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return -1;
  }
}

/**
 * Generate summary statistics from scan history
 */
export function calculateScanStatistics(scans: ScanData[]) {
  if (scans.length === 0)
    return {
      totalScans: 0,
      avgScore: 0,
      highestScore: 0,
      lowestScore: 0,
      improvementTrend: 'stable' as const,
    };

  const scores = scans.map((s) => s.score || 0);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);

  // Check improvement trend
  const recentScores = scores.slice(-5);
  const oldScores = scores.slice(Math.max(0, scores.length - 10), scores.length - 5);

  let improvementTrend: 'up' | 'down' | 'stable' = 'stable';
  if (recentScores.length > 0 && oldScores.length > 0) {
    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const oldAvg = oldScores.reduce((a, b) => a + b, 0) / oldScores.length;
    if (recentAvg > oldAvg + 5) improvementTrend = 'up';
    else if (recentAvg < oldAvg - 5) improvementTrend = 'down';
  }

  return {
    totalScans: scans.length,
    avgScore,
    highestScore,
    lowestScore,
    improvementTrend,
  };
}

/**
 * Sanitize string for safe display (prevents XSS)
 */
export function sanitizeString(str: string | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Truncate string to max length
 */
export function truncateString(str: string | undefined, maxLength: number = 100): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}
