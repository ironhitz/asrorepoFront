import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, ShieldAlert, TrendingUp, Lock, Globe, ChevronRight, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { PipelineStage } from '../types';

interface PipelineOrchestrationProps {
  stages: PipelineStage[];
}

const PipelineOrchestration: React.FC<PipelineOrchestrationProps> = ({ stages }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'compliance': return ShieldCheck;
      case 'patch': return Zap;
      case 'threat': return ShieldAlert;
      case 'optimizer': return TrendingUp;
      case 'gate': return Lock;
      case 'deploy': return Globe;
      default: return CheckCircle2;
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">ASRO Pipeline Orchestration</h2>
            <p className="text-zinc-500 text-sm mt-1">Sequential security gates and parallel analysis stages.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">All Gates Passing</span>
            </div>
          </div>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -translate-y-1/2 hidden lg:block" />

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 relative z-10">
            {stages.map((stage, index) => {
              const Icon = getIcon(stage.id);
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className={`p-6 rounded-2xl border transition-all duration-300 h-full flex flex-col ${
                    stage.status === 'success' 
                      ? 'bg-zinc-900/50 border-emerald-500/20 group-hover:border-emerald-500/40' 
                      : 'bg-zinc-900/50 border-white/5 group-hover:border-white/10'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        stage.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {stage.blocking && (
                        <div className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[8px] font-bold text-red-500 uppercase tracking-widest">
                          Blocking
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-white text-sm mb-1">{stage.name}</h3>
                    <p className="text-[10px] text-zinc-500 leading-relaxed mb-4 flex-1">
                      {stage.description}
                    </p>

                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter">
                        <span className="text-zinc-500">Status</span>
                        <span className={stage.status === 'success' ? 'text-emerald-500' : 'text-zinc-400'}>
                          {stage.status}
                        </span>
                      </div>
                      {stage.score !== undefined && (
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter">
                          <span className="text-zinc-500">Score</span>
                          <span className={stage.score >= 80 ? 'text-emerald-500' : 'text-red-500'}>
                            {stage.score}/100
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter">
                        <span className="text-zinc-500">Duration</span>
                        <span className="text-zinc-300 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {stage.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  {index < stages.length - 1 && (
                    <div className="absolute top-1/2 -right-4 -translate-y-1/2 hidden lg:block text-zinc-800">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-gitlab-orange" />
            Deterministic Blocking Logic
          </h3>
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2">
              <p className="text-emerald-500">FINAL_GATE_DECISION = PASS</p>
              <div className="pl-4 border-l border-white/10 space-y-2">
                <p className="text-zinc-400">IF compliance_score &lt; 80 THEN</p>
                <p className="text-red-500 pl-4">FINAL_GATE_DECISION = BLOCK</p>
                <p className="text-zinc-400">IF critical_vulnerabilities &gt; 0 THEN</p>
                <p className="text-red-500 pl-4">FINAL_GATE_DECISION = BLOCK</p>
                <p className="text-zinc-400">IF critical_threats &gt; 0 AND block_on_critical THEN</p>
                <p className="text-red-500 pl-4">FINAL_GATE_DECISION = BLOCK</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Artifact Dependencies
          </h3>
          <div className="space-y-4">
            {[
              { from: 'Compliance Check', to: 'Final Gate', artifact: 'compliance_report.json' },
              { from: 'Security Patch', to: 'Final Gate', artifact: 'vulnerability_report.json' },
              { from: 'Threat Model', to: 'Final Gate', artifact: 'threat_assessment.json' },
              { from: 'Final Gate', to: 'Deployment', artifact: 'gate_decision.json' },
            ].map((dep, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex-1">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">{dep.from}</p>
                  <p className="text-xs text-white font-bold">{dep.artifact}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-700" />
                <div className="flex-1 text-right">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Consumer</p>
                  <p className="text-xs text-white font-bold">{dep.to}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineOrchestration;
