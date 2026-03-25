import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, ArrowRight, Clock, History, X, Loader2, Terminal as TerminalIcon } from 'lucide-react';
import { Vulnerability, DashboardStats } from '../types';

interface SecurityPostureProps {
  stats: DashboardStats;
  vulnerabilities: Vulnerability[];
  onPatch?: (vuln: Vulnerability) => void;
  patchingId?: string | null;
}

const SecurityPosture: React.FC<SecurityPostureProps> = ({ stats, vulnerabilities, onPatch, patchingId }) => {
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-[2px] shadow-lg hover:border-white/20 transition-all group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gitlab-orange/10 to-transparent opacity-0 group-hover:opacity-10 transition-opacity" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Risk Score</span>
            <div className="p-2 bg-gitlab-orange/10 rounded-[2px] border border-gitlab-orange/20 shadow-inner">
              <ShieldAlert className="w-4 h-4 text-gitlab-orange" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-4xl font-bold text-white tracking-tight">{stats.riskScore.toFixed(1)}</span>
            <span className="text-zinc-500 text-xs font-bold">/ 10</span>
          </div>
          <div className="mt-4 h-1 bg-zinc-800 rounded-[2px] overflow-hidden relative z-10 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-gitlab-orange to-gitlab-light-orange transition-all duration-1000 shadow-[0_0_8px_rgba(226,67,41,0.5)]" 
              style={{ width: `${(10 - stats.riskScore) * 10}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-[2px] shadow-lg hover:border-white/20 transition-all group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-10 transition-opacity" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Critical</span>
            <div className="p-2 bg-red-500/10 rounded-[2px] border border-red-500/20 shadow-inner">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <span className="text-4xl font-bold text-white tracking-tight relative z-10">{stats.criticalCount}</span>
          <p className="text-[10px] font-bold text-zinc-500 mt-2 uppercase tracking-wider relative z-10">Active vulnerabilities</p>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-[2px] shadow-lg hover:border-white/20 transition-all group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gitlab-purple/10 to-transparent opacity-0 group-hover:opacity-10 transition-opacity" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">MTTP</span>
            <div className="p-2 bg-gitlab-purple/10 rounded-[2px] border border-gitlab-purple/20 shadow-inner">
              <Clock className="w-4 h-4 text-gitlab-purple" />
            </div>
          </div>
          <span className="text-4xl font-bold text-white tracking-tight relative z-10">{stats.mttp}</span>
          <p className="text-[10px] font-bold text-zinc-500 mt-2 uppercase tracking-wider relative z-10">Mean time to patch</p>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-[2px] shadow-lg hover:border-white/20 transition-all group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gitlab-orange/10 to-transparent opacity-0 group-hover:opacity-10 transition-opacity" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Auto-Fixed</span>
            <div className="p-2 bg-gitlab-orange/10 rounded-[2px] border border-gitlab-orange/20 shadow-inner">
              <CheckCircle2 className="w-4 h-4 text-gitlab-orange" />
            </div>
          </div>
          <span className="text-4xl font-bold text-white tracking-tight relative z-10">{stats.autoFixedCount}</span>
          <p className="text-[10px] font-bold text-zinc-500 mt-2 uppercase tracking-wider relative z-10">Autonomous remediations</p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-white/10 rounded-[2px] overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-zinc-900 to-zinc-950">
          <h3 className="text-lg font-bold text-white tracking-tight uppercase">Vulnerability Backlog</h3>
          <button className="text-[10px] text-gitlab-orange hover:text-gitlab-light-orange font-bold uppercase tracking-widest flex items-center gap-1 transition-all">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-zinc-950/50">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Vulnerability</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Severity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Detected</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {vulnerabilities.map((vuln) => (
                <tr key={vuln.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-gitlab-orange transition-colors">{vuln.title}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5 opacity-70">{vuln.file}:{vuln.line}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase border ${
                      vuln.severity === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.1)]' :
                      vuln.severity === 'high' ? 'bg-gitlab-orange/10 text-gitlab-orange border-gitlab-orange/20 shadow-[0_0_8px_rgba(226,67,41,0.1)]' :
                      'bg-zinc-800/50 text-zinc-400 border-white/5'
                    }`}>
                      {vuln.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${
                        vuln.status === 'patched' ? 'text-gitlab-orange bg-gitlab-orange' :
                        vuln.status === 'patching' ? 'text-gitlab-purple bg-gitlab-purple animate-pulse' :
                        'text-red-500 bg-red-500'
                      }`}></div>
                      <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">{vuln.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    {new Date(vuln.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedVuln(vuln)}
                        className="text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-[2px] border border-white/10 transition-all flex items-center gap-2 shadow-sm"
                      >
                        <History className="w-3 h-3" />
                        History
                      </button>
                      {vuln.status !== 'patched' && onPatch && (
                        <button 
                          onClick={() => onPatch(vuln)}
                          disabled={patchingId === vuln.id || vuln.status === 'patching'}
                          className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-[2px] border transition-all flex items-center gap-2 shadow-sm ${
                            patchingId === vuln.id || vuln.status === 'patching'
                              ? 'bg-zinc-800 text-zinc-500 border-white/5 cursor-not-allowed'
                              : 'bg-gradient-to-b from-gitlab-orange to-gitlab-light-orange text-white border-gitlab-orange shadow-[0_2px_8px_rgba(226,67,41,0.3)] hover:shadow-[0_4px_12px_rgba(226,67,41,0.4)]'
                          }`}
                        >
                          {patchingId === vuln.id || vuln.status === 'patching' ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <ShieldAlert className="w-3 h-3" />
                          )}
                          {patchingId === vuln.id || vuln.status === 'patching' ? 'Patching...' : 'AI Patch'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vulnerability History Modal */}
      {selectedVuln && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-white/10 rounded-[2px] w-full max-w-2xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-b from-zinc-900 to-zinc-950">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight uppercase">{selectedVuln.title}</h3>
                <p className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-widest opacity-70">Lifecycle History & Remediation Path</p>
              </div>
              <button onClick={() => setSelectedVuln(null)} className="p-2 hover:bg-white/5 rounded-[2px] text-zinc-500 hover:text-white transition-all border border-transparent hover:border-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto bg-black/20">
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gitlab-orange before:via-gitlab-purple before:to-transparent">
                {selectedVuln.history?.map((event, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-start md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-[2px] border border-white/10 bg-zinc-950 text-zinc-500 group-[.is-active]:text-gitlab-orange group-[.is-active]:border-gitlab-orange/50 shadow-lg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <div className="w-2 h-2 rounded-full bg-current shadow-[0_0_8px_currentColor]"></div>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-[2px] border border-white/5 bg-zinc-900/50 shadow-md hover:border-white/10 transition-all">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-white text-[10px] uppercase tracking-widest">{event.status}</div>
                        <time className="font-mono text-[10px] text-zinc-500 font-bold">{new Date(event.timestamp).toLocaleString()}</time>
                      </div>
                      <div className="text-xs text-zinc-400 leading-relaxed">{event.message}</div>
                      {event.agentId && (
                        <div className="mt-3 text-[10px] text-gitlab-orange font-bold uppercase tracking-widest flex items-center gap-2">
                          <TerminalIcon className="w-3 h-3" />
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
            <div className="p-6 border-t border-white/10 bg-zinc-950/50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedVuln(null)}
                className="px-6 py-2 bg-gradient-to-b from-white to-zinc-200 text-black rounded-[2px] font-bold text-[10px] uppercase tracking-widest hover:from-white hover:to-white transition-all shadow-md active:shadow-inner"
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
