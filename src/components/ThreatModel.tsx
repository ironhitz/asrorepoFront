import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, Loader2, Brain, Zap, Target } from 'lucide-react';
import { ThreatModel as ThreatModelType } from '../types';
import { motion } from 'motion/react';

interface ThreatModelProps {
  projectId: string;
}

const ThreatModel: React.FC<ThreatModelProps> = ({ projectId }) => {
  const [model, setModel] = useState<ThreatModelType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateThreatModel = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/gitlab/threat-model?projectId=${projectId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate threat model');
      }
      const data = await res.json();
      setModel(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      generateThreatModel();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="relative">
          <Brain className="w-12 h-12 text-gitlab-orange animate-pulse" />
          <Zap className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-white">AI Threat Modeling in Progress</h3>
          <p className="text-zinc-500 text-sm mt-1">Analyzing dependencies and architectural risks...</p>
        </div>
        <Loader2 className="w-6 h-6 text-gitlab-orange animate-spin mt-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Threat Modeling Failed</h3>
        <p className="text-red-400 text-sm mb-6">{error}</p>
        <button 
          onClick={generateThreatModel}
          className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 transition-all"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  if (!model) return null;

  return (
    <div className="space-y-8">
      <div className="bg-zinc-900 border border-white/5 p-8 rounded-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6 text-gitlab-orange" />
          <h3 className="text-xl font-bold text-white tracking-tight">AI Security Summary</h3>
        </div>
        <p className="text-zinc-300 leading-relaxed italic">
          "{model.summary}"
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h4 className="text-lg font-bold text-white">Identified Threats</h4>
          </div>
          {model.threats.map((threat, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="bg-zinc-900 border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-bold text-white">{threat.title}</h5>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  threat.severity === 'Critical' ? 'bg-red-500/10 text-red-500' :
                  threat.severity === 'High' ? 'bg-orange-500/10 text-orange-500' :
                  threat.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-blue-500/10 text-blue-500'
                }`}>
                  {threat.severity}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">{threat.description}</p>
              <div className="bg-white/5 p-3 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Mitigation Strategy</span>
                </div>
                <p className="text-[11px] text-zinc-300">{threat.mitigation}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-gitlab-orange" />
            <h4 className="text-lg font-bold text-white">Potential Attack Vectors</h4>
          </div>
          <div className="bg-zinc-900 border border-white/5 p-8 rounded-3xl space-y-4">
            {model.attackVectors.map((vector, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={idx} 
                className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-gitlab-orange/30 transition-all group"
              >
                <div className="w-8 h-8 bg-gitlab-orange/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-gitlab-orange/20 transition-all">
                  <AlertTriangle className="w-4 h-4 text-gitlab-orange" />
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{vector}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="bg-gitlab-orange/5 border border-gitlab-orange/10 p-6 rounded-2xl">
            <p className="text-xs text-zinc-500 italic">
              Note: This threat model is generated by AI based on repository dependency files. 
              Always verify findings with manual architectural reviews and automated SCA tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatModel;
