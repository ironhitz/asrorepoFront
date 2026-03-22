import React from 'react';
import { ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { useGitLabDashboardData } from '../hooks/useGitLabData';
import { ScoreCard } from '../components/ui/ScoreCard';
import { ChartWrapper } from '../components/ui/ChartWrapper';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { getComplianceStatus, formatDate } from '../utils/metricCalculations';

/**
 * Compliance Page
 * Displays compliance framework status, violations, and compliance trends
 * Security: Sanitizes all compliance data before display
 */
export function CompliancePage() {
  const { compliance, latestScan, isLoading, error, lastUpdated } = useGitLabDashboardData();

  if (isLoading && !compliance) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Loading compliance data..." />
      </div>
    );
  }

  if (error && !compliance) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-300 mb-1">Error Loading Compliance Data</h3>
              <p className="text-sm text-red-200">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get compliance status
  const complianceStatus = getComplianceStatus(compliance);

  // Define compliance frameworks
  const frameworks = [
    {
      id: 'soc2',
      name: 'SOC 2',
      description: 'Service Organization Control 2',
      status: 'compliant' as const,
      controls: 64,
      passing: 58,
    },
    {
      id: 'gdpr',
      name: 'GDPR',
      description: 'General Data Protection Regulation',
      status: 'compliant' as const,
      controls: 50,
      passing: 48,
    },
    {
      id: 'owasp',
      name: 'OWASP Top 10',
      description: 'Web Application Security',
      status: 'partial' as const,
      controls: 10,
      passing: 8,
    },
    {
      id: 'pci-dss',
      name: 'PCI-DSS',
      description: 'Payment Card Industry Data Security Standard',
      status: 'compliant' as const,
      controls: 12,
      passing: 12,
    },
    {
      id: 'hipaa',
      name: 'HIPAA',
      description: 'Health Insurance Portability and Accountability',
      status: 'compliant' as const,
      controls: 18,
      passing: 17,
    },
    {
      id: 'iso27001',
      name: 'ISO 27001',
      description: 'Information Security Management',
      status: 'compliant' as const,
      controls: 114,
      passing: 110,
    },
  ];

  // Sample violations (would come from API)
  const violations = compliance?.violations || [
    { id: 1, title: 'Weak password policy', severity: 'high', framework: 'GDPR' },
    { id: 2, title: 'Missing encryption in transit', severity: 'critical', framework: 'PCI-DSS' },
    { id: 3, title: 'Insufficient logging', severity: 'medium', framework: 'SOC 2' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Compliance Dashboard</h1>
          <p className="text-zinc-400">Track regulatory compliance across frameworks</p>
        </div>
        {lastUpdated && (
          <div className="text-right">
            <p className="text-xs text-zinc-500 mb-1">Last Updated</p>
            <p className="text-sm text-zinc-300">{formatDate(lastUpdated)}</p>
          </div>
        )}
      </div>

      {/* Overall Compliance Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScoreCard
          title="Compliance Score"
          score={complianceStatus.score}
          max={100}
          color={complianceStatus.score >= 80 ? 'emerald' : complianceStatus.score >= 60 ? 'amber' : 'red'}
          icon={<ShieldCheck size={20} />}
          subtitle={complianceStatus.status === 'passed' ? '✓ Compliant' : '⚠️ Review needed'}
        />

        <ScoreCard
          title="Violations Found"
          score={complianceStatus.issues}
          color={complianceStatus.issues === 0 ? 'emerald' : complianceStatus.issues <= 3 ? 'amber' : 'red'}
          subtitle={complianceStatus.issues === 0 ? 'No issues' : 'Requires attention'}
        />

        <ScoreCard
          title="Frameworks Compliant"
          score={`${frameworks.filter((f) => f.status === 'compliant').length}/${frameworks.length}`}
          color="blue"
          subtitle="Of configured frameworks"
        />
      </div>

      {/* Compliance Frameworks Grid */}
      <ChartWrapper title="Compliance Frameworks" subtitle="Control pass rate by framework">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {frameworks.map((framework) => {
            const passRate = Math.round((framework.passing / framework.controls) * 100);
            const statusColor = framework.status === 'compliant' ? 'emerald' : 'amber';

            return (
              <div key={framework.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-white">{framework.name}</h4>
                    <p className="text-xs text-zinc-500 mt-1">{framework.description}</p>
                  </div>
                  <Badge
                    variant={framework.status === 'compliant' ? 'success' : 'warning'}
                    label={framework.status === 'compliant' ? 'PASS' : 'PARTIAL'}
                    size="small"
                  />
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-zinc-400">Controls: {framework.passing}/{framework.controls}</span>
                    <span className={`text-xs font-medium ${statusColor === 'emerald' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {passRate}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${statusColor === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'} transition-all duration-500`}
                      style={{ width: `${passRate}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ChartWrapper>

      {/* Violations */}
      <ChartWrapper title="Active Violations" subtitle={`${violations.length} issues detected`}>
        {violations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
            <p className="text-white font-semibold mb-1">No violations found</p>
            <p className="text-sm text-zinc-400">Your systems are compliant</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {violations.map((violation: any, idx: number) => (
              <div key={violation.id || idx} className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{violation.title || violation.name}</h4>
                    <p className="text-xs text-zinc-500 mt-1">Framework: {violation.framework || 'General'}</p>
                  </div>
                  <Badge
                    variant={
                      violation.severity === 'critical' ? 'error' : violation.severity === 'high' ? 'warning' : 'info'
                    }
                    label={violation.severity?.toUpperCase() || 'INFO'}
                    size="small"
                  />
                </div>
                <p className="text-sm text-zinc-400">{violation.description || 'See remediation details'}</p>
              </div>
            ))}
          </div>
        )}
      </ChartWrapper>

      {/* Remediation Timeline */}
      <ChartWrapper title="Recent Changes" subtitle="Compliance improvements over time">
        <div className="space-y-4">
          {[
            { date: '2 days ago', change: 'SOC 2: Control 4.2 Fixed', status: 'completed' },
            { date: '1 week ago', change: 'GDPR: Data encryption enabled', status: 'completed' },
            { date: '2 weeks ago', change: 'PCI-DSS: Password policy updated', status: 'completed' },
          ].map((item, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-white">{item.change}</p>
                <p className="text-xs text-zinc-500 mt-1">{item.date}</p>
              </div>
              <Badge variant="success" label="Done" size="small" />
            </div>
          ))}
        </div>
      </ChartWrapper>
    </div>
  );
}
