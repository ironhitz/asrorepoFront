import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, FileText, ExternalLink, Shield, Database, RefreshCw } from 'lucide-react';
import seedData from '../seed';

interface AboutProps {
  projectId: string;
}

const About: React.FC<AboutProps> = ({ projectId }) => {
  const [readme, setReadme] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedData(projectId);
      alert('ASRO Data seeded successfully! Please refresh the page to see the new agents and pipeline stages.');
    } catch (err) {
      console.error(err);
      alert('Failed to seed data.');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    const fetchReadme = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`/api/gitlab/files?projectId=${projectId}&path=README.md`);
        if (!response.ok) throw new Error('Failed to fetch README.md');
        const data = await response.json();
        setReadme(atob(data.content));
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Could not load README.md from GitLab.');
      } finally {
        setLoading(false);
      }
    };

    fetchReadme();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-gitlab-orange" />
        <p className="text-sm font-bold uppercase tracking-widest">Fetching project documentation...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gitlab-orange/10 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-gitlab-orange" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Project Documentation</h2>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">README.md from GitLab</p>
            </div>
          </div>
          <a 
            href={`https://gitlab.com/git-lab-AI-hackathon/asrorepo/-/blob/main/README.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View on GitLab
          </a>
        </div>
        
        <div className="p-8 prose prose-invert prose-zinc max-w-none">
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="w-12 h-12 text-zinc-800 mb-4" />
              <p className="text-zinc-500 font-bold">{error}</p>
              <p className="text-xs text-zinc-600 mt-2">Ensure the project has a README.md file in the root directory.</p>
            </div>
          ) : (
            <div className="markdown-body">
              <ReactMarkdown>{readme}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-gitlab-orange/10 to-transparent border border-gitlab-orange/20 p-8 rounded-3xl">
          <h3 className="text-lg font-bold text-white mb-4">GitLab AI Hackathon</h3>
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            ASRO (AI Security Orchestration) is a cutting-edge platform designed to automate security workflows within GitLab. 
            By leveraging advanced AI models like Gemini, we provide real-time threat modeling, vulnerability patching, and pipeline intelligence.
          </p>
          <div className="flex flex-wrap gap-2">
            {['AI-Driven', 'Security', 'Automation', 'GitLab', 'Gemini'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-gitlab-orange/10 border border-gitlab-orange/20 rounded-full text-[10px] font-bold text-gitlab-orange uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="bg-zinc-900 border border-white/5 p-8 rounded-3xl">
          <h3 className="text-lg font-bold text-white mb-4">Core Mission</h3>
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            Our mission is to bridge the gap between security detection and remediation. 
            ASRO doesn't just find bugs; it orchestrates the entire lifecycle of a security event, 
            from identification to the final merge request, ensuring your GitLab repositories stay secure by default.
          </p>
          <button 
            onClick={handleSeed}
            disabled={seeding}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-2xl font-bold text-white transition-all disabled:opacity-50"
          >
            {seeding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5 text-gitlab-orange" />}
            {seeding ? 'Seeding...' : 'Seed ASRO Demo Data'}
          </button>
        </div>
      </div>

      <div className="mt-12 space-y-12">
        <div className="bg-zinc-900 border border-white/5 p-12 rounded-[40px]">
          <h3 className="text-3xl font-bold text-white mb-8 tracking-tight">Core Functionality & Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Autonomous Remediation', desc: 'AI agents that not only find vulnerabilities but automatically create patch MRs and verify fixes.' },
              { title: 'STRIDE Threat Modeling', desc: 'Continuous architectural analysis using the STRIDE methodology to predict attack vectors before they are exploited.' },
              { title: 'Pipeline Orchestration', desc: 'Deterministic security gates that block deployments based on real-time compliance scores and risk levels.' },
              { title: 'Sustainability Tracking', desc: 'Green Agent calculates carbon footprint and energy usage of your CI/CD pipelines, recommending optimizations.' },
              { title: 'Self-Healing CI/CD', desc: 'Autonomous debugging and re-triggering of failed pipelines when non-critical errors are detected.' },
              { title: 'Compliance Dashboard', desc: 'Real-time SOC2, ISO 27001, and HIPAA compliance scoring based on repository state.' }
            ].map((feature, i) => (
              <div key={i} className="space-y-3 p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-gitlab-orange/20 transition-all">
                <h4 className="font-bold text-white">{feature.title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 p-12 rounded-[40px]">
          <h3 className="text-3xl font-bold text-white mb-8 tracking-tight">Monetization & Profitability</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-emerald-500">Subscription Tiers</h4>
              <div className="space-y-4">
                <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                  <p className="font-bold text-white">Free Tier</p>
                  <p className="text-xs text-zinc-500 mt-1">1 Project, Basic Scanning, Manual Remediation</p>
                </div>
                <div className="p-6 bg-black/40 rounded-3xl border border-emerald-500/20">
                  <p className="font-bold text-white">Pro Tier ($49/mo)</p>
                  <p className="text-xs text-zinc-500 mt-1">Unlimited Projects, Autonomous Remediation, Threat Modeling</p>
                </div>
                <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                  <p className="font-bold text-white">Enterprise (Custom)</p>
                  <p className="text-xs text-zinc-500 mt-1">SLA, Dedicated Support, Custom Compliance Frameworks</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-emerald-500">Token & Compute Credits</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                ASRO uses a **Compute Credit System** for AI-intensive tasks like deep code analysis, patch generation, and STRIDE modeling. 
                Users can purchase additional credits to scale their security operations.
              </p>
              <ul className="space-y-3 text-xs text-zinc-500">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  1 Credit = 1 AI Scan or 1 Patch Generation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Monthly Pro Tier includes 500 free credits
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Enterprise users get unlimited credits on dedicated infrastructure
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
