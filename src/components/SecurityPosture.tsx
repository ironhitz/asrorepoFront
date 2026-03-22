import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, ArrowRight, Clock, History, X } from 'lucide-react';
import { Vulnerability, DashboardStats } from '../types';

interface SecurityPostureProps {
  stats: DashboardStats;
  vulnerabilities: Vulnerability[];
}

const SecurityPosture: React.FC<SecurityPostureProps> = ({ stats, vulnerabilities }) => {
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Risk Score</span>
            <ShieldAlert className="w-5 h-5 text-gitlab-orange" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{stats.riskScore.toFixed(1)}</span>
            <span className="text-zinc-500 text-sm">/ 10</span>
          </div>
          <div className="mt-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gitlab-orange transition-all duration-1000" 
              style={{ width: `${(10 - stats.riskScore) * 10}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Critical</span>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <span className="text-4xl font-bold text-white">{stats.criticalCount}</span>
          <p className="text-xs text-zinc-500 mt-2">Active vulnerabilities</p>
        </div>

        <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">MTTP</span>
            <Clock className="w-5 h-5 text-gitlab-purple" />
          </div>
          <span className="text-4xl font-bold text-white">{stats.mttp}</span>
          <p className="text-xs text-zinc-500 mt-2">Mean time to patch</p>
        </div>

        <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Auto-Fixed</span>
            <CheckCircle2 className="w-5 h-5 text-gitlab-orange" />
          </div>
          <span className="text-4xl font-bold text-white">{stats.autoFixedCount}</span>
          <p className="text-xs text-zinc-500 mt-2">Autonomous remediations</p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Vulnerability Backlog</h3>
          <button className="text-xs text-gitlab-orange hover:text-gitlab-light-orange font-medium flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Vulnerability</th>
                <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Detected</th>
                <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {vulnerabilities.map((vuln) => (
                <tr key={vuln.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-white">{vuln.title}</div>
                      <div className="text-xs text-zinc-500 font-mono">{vuln.file}:{vuln.line}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      vuln.severity === 'critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      vuln.severity === 'high' ? 'bg-gitlab-orange/10 text-gitlab-orange border border-gitlab-orange/20' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {vuln.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        vuln.status === 'patched' ? 'bg-gitlab-orange' :
                        vuln.status === 'patching' ? 'bg-gitlab-purple animate-pulse' :
                        'bg-red-500'
                      }`}></div>
                      <span className="text-xs text-zinc-300 capitalize">{vuln.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    {new Date(vuln.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedVuln(vuln)}
                      className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-all flex items-center gap-2"
                    >
                      <History className="w-3 h-3" />
                      History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vulnerability History Modal */}
      {selectedVuln && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedVuln.title}</h3>
                <p className="text-xs text-zinc-500 mt-1">Lifecycle History & Remediation Path</p>
              </div>
              <button onClick={() => setSelectedVuln(null)} className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gitlab-orange before:via-gitlab-purple before:to-transparent">
                {selectedVuln.history?.map((event, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-start md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-zinc-950 text-zinc-500 group-[.is-active]:text-gitlab-orange group-[.is-active]:border-gitlab-orange/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <div className="w-2 h-2 rounded-full bg-current"></div>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-white/5 bg-white/5">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-white text-sm capitalize">{event.status}</div>
                        <time className="font-mono text-[10px] text-zinc-500">{new Date(event.timestamp).toLocaleString()}</time>
                      </div>
                      <div className="text-xs text-zinc-400">{event.message}</div>
                      {event.agentId && (
                        <div className="mt-2 text-[10px] text-gitlab-orange font-bold uppercase tracking-widest">
                          Agent: {event.agentId}
                        </div>
                      )}
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-zinc-500 italic text-sm">
                    No history recorded for this vulnerability.
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-white/5 bg-zinc-950/50 flex justify-end">
              <button 
                onClick={() => setSelectedVuln(null)}
                className="px-6 py-2 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityPosture;
