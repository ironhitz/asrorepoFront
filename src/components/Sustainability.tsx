import React from 'react';
import { Leaf, Zap, Cloud, TrendingDown, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { SustainabilityMetrics } from '../types';
import { motion } from 'motion/react';

interface SustainabilityProps {
  metrics: SustainabilityMetrics | null;
}

const Sustainability: React.FC<SustainabilityProps> = ({ metrics }) => {
  if (!metrics) return null;

  const stats = [
    { label: 'Carbon Footprint', value: `${metrics.carbonFootprint}g`, sub: 'CO2e per pipeline', icon: Cloud, color: 'text-emerald-500' },
    { label: 'Energy Usage', value: `${metrics.energyUsage}Wh`, sub: 'Total compute energy', icon: Zap, color: 'text-yellow-500' },
    { label: 'Green Score', value: `${metrics.greenScore}/100`, sub: 'Sustainability rating', icon: Leaf, color: 'text-emerald-400' },
    { label: 'Optimization', value: `${metrics.optimizationSavings}%`, sub: 'Energy saved vs baseline', icon: TrendingDown, color: 'text-emerald-500' },
  ];

  const recommendations = [
    { title: 'Parallelize Test Suites', desc: 'Reduce total wall-clock time by splitting large test suites across multiple runners.', impact: 'High' },
    { title: 'Cache Dependencies', desc: 'Ensure node_modules and other dependencies are correctly cached to avoid redundant downloads.', impact: 'Medium' },
    { title: 'Use ARM64 Runners', desc: 'Switch to Graviton or other ARM-based runners for better performance-per-watt.', impact: 'High' },
    { title: 'Optimize Docker Layers', desc: 'Reduce image size and build time by combining RUN commands and using multi-stage builds.', impact: 'Medium' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-emerald-500" />
            </div>
            <h2 className="text-4xl font-bold text-white tracking-tight">Green Agent Intelligence</h2>
          </div>
          <p className="text-zinc-500 max-w-2xl leading-relaxed">
            The ASRO Green Agent monitors the environmental impact of your CI/CD pipelines, calculating carbon emissions and energy consumption while providing actionable optimization strategies.
          </p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-8 py-6 rounded-[32px] flex flex-col items-center">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Overall Status</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-2xl font-bold text-white">Optimized</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className="bg-zinc-900 border border-white/5 p-8 rounded-[40px] space-y-4 hover:border-emerald-500/20 transition-all group"
          >
            <div className={`w-12 h-12 bg-black/40 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-emerald-500/20 transition-all`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
              <p className="text-sm font-bold text-zinc-400">{stat.label}</p>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900 border border-white/5 rounded-[40px] p-12">
            <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">Sustainability Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {recommendations.map((rec, i) => (
                <div key={i} className="bg-black/40 border border-white/5 p-8 rounded-[32px] space-y-4 hover:border-emerald-500/20 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-emerald-500" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${rec.impact === 'High' ? 'text-emerald-500' : 'text-yellow-500'}`}>
                      {rec.impact} Impact
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-white group-hover:text-emerald-500 transition-colors">{rec.title}</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">{rec.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 p-10 rounded-[40px] space-y-6">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-emerald-500" />
              <h3 className="text-xl font-bold text-white">Why it matters?</h3>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              CI/CD pipelines are responsible for a significant portion of a software project's carbon footprint. 
              By optimizing build times and resource usage, you not only save on compute costs but also contribute to a more sustainable tech ecosystem.
            </p>
            <div className="pt-4 border-t border-emerald-500/10">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Estimated Savings</p>
              <p className="text-3xl font-bold text-white">$1,240 <span className="text-sm font-normal text-zinc-500">/ year</span></p>
            </div>
          </div>

          <div className="bg-zinc-900 border border-white/5 p-10 rounded-[40px] space-y-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <h3 className="text-xl font-bold text-white">Active Alerts</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                <p className="text-xs text-zinc-400">Inefficient caching in <span className="text-white font-bold">build-job</span></p>
              </div>
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                <p className="text-xs text-zinc-400">Redundant test runs detected in <span className="text-white font-bold">main</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sustainability;
