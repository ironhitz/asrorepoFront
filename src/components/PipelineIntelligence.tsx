import React from 'react';
import { GitBranch, CheckCircle2, XCircle, Play, ExternalLink, Cpu } from 'lucide-react';
import { PipelineEvent } from '../types';

interface PipelineIntelligenceProps {
  pipelines: PipelineEvent[];
}

const PipelineIntelligence: React.FC<PipelineIntelligenceProps> = ({ pipelines }) => {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-semibold text-white">CI/CD Pipeline Intelligence</h3>
            <p className="text-sm text-zinc-500">Autonomous self-healing and security validation loops</p>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1.5 bg-gitlab-orange/10 border border-gitlab-orange/20 rounded-lg flex items-center gap-2">
              <Cpu className="w-4 h-4 text-gitlab-orange" />
              <span className="text-xs font-medium text-gitlab-orange">Self-Healing Active</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {pipelines.map((p) => (
            <div key={p.id} className="bg-zinc-900 border border-white/5 rounded-xl p-4 flex items-center justify-between hover:border-white/10 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  p.status === 'success' ? 'bg-gitlab-orange/10 text-gitlab-orange' :
                  p.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                  'bg-gitlab-purple/10 text-gitlab-purple'
                }`}>
                  {p.status === 'success' ? <CheckCircle2 className="w-6 h-6" /> :
                   p.status === 'failed' ? <XCircle className="w-6 h-6" /> :
                   <Play className="w-6 h-6 animate-pulse" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Pipeline #{p.id}</span>
                    <span className="text-xs text-zinc-500 font-mono">[{p.ref}]</span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    Started {new Date(p.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {p.status === 'failed' && (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">AI Intervention</span>
                    <button className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/20 transition-all flex items-center gap-2">
                      <Cpu className="w-3 h-3" />
                      Auto-Debug
                    </button>
                  </div>
                )}
                
                <a 
                  href={p.webUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Autonomous Fix Iterations</h4>
          <div className="space-y-4">
            <div className="relative pl-6 border-l border-gitlab-orange/30 pb-4">
              <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-gitlab-orange"></div>
              <p className="text-xs text-zinc-400 mb-1">Iteration #1 - GPT-4</p>
              <p className="text-sm text-white">Generated patch for CVE-2024-1234 in auth.ts</p>
              <div className="mt-2 text-[10px] font-mono bg-black/50 p-2 rounded border border-white/5 text-gitlab-orange">
                + if (!validateToken(token)) return 401;
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Pipeline Health Metrics</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Success Rate</span>
              <span className="text-sm font-bold text-gitlab-orange">94.2%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gitlab-orange w-[94.2%]"></div>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-zinc-400">AI Fix Accuracy</span>
              <span className="text-sm font-bold text-gitlab-purple">88.5%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gitlab-purple w-[88.5%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineIntelligence;
