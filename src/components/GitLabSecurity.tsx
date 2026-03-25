import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle2, XCircle, Loader2, ExternalLink, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface GitLabSecurityProps {
  projectId: string;
}

const GitLabSecurity: React.FC<GitLabSecurityProps> = ({ projectId }) => {
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVulnerabilities = async () => {
      if (!projectId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/gitlab/vulnerabilities?projectId=${projectId}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setVulnerabilities(data);
        } else {
          setVulnerabilities([]);
        }
      } catch (err) {
        setError('Failed to fetch vulnerabilities from GitLab.');
      } finally {
        setLoading(false);
      }
    };

    fetchVulnerabilities();
  }, [projectId]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-gitlab-orange animate-spin mb-4" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Fetching GitLab Vulnerabilities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">GitLab Security Center</h2>
          <p className="text-zinc-500 mt-1">Native GitLab vulnerabilities detected via SAST, DAST, and Dependency Scanning.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Total Detected</span>
            <span className="text-xl font-bold text-white">{vulnerabilities.length}</span>
          </div>
        </div>
      </div>

      {vulnerabilities.length === 0 ? (
        <div className="bg-zinc-900 border border-white/5 p-12 rounded-3xl flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Vulnerabilities Detected</h3>
          <p className="text-zinc-500 max-w-md">
            GitLab security scanners haven't reported any vulnerabilities for this project. 
            Ensure your <code className="text-gitlab-orange">.gitlab-ci.yml</code> is configured with security templates.
          </p>
          <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 text-left w-full max-w-lg">
            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-2 tracking-widest">Ultimate Feature Note</p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The GitLab Vulnerability API requires a **GitLab Ultimate** license. If you are on a free or premium tier, this list will remain empty. ASRO's AI-powered scanner (in the Security Posture tab) works on all tiers.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {vulnerabilities.map((vuln) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={vuln.id}
              className="bg-zinc-900 border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityColor(vuln.severity)}`}>
                      {vuln.severity}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{vuln.report_type}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white group-hover:text-gitlab-orange transition-colors">{vuln.name}</h4>
                  <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{vuln.description}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{vuln.state}</span>
                    </div>
                    {vuln.location && (
                      <div className="text-xs text-zinc-500 font-mono bg-black/30 px-2 py-0.5 rounded border border-white/5">
                        {vuln.location.file || vuln.location.image}
                      </div>
                    )}
                  </div>
                </div>
                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5">
                  <ExternalLink className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GitLabSecurity;
