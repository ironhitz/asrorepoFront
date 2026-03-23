import React, { useState, useEffect } from 'react';
import { supabase } from './utils/supabase';
import { User, Session } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import SecurityPosture from './components/SecurityPosture';
import ActivityFeed from './components/ActivityFeed';
import AgentGraph from './components/AgentGraph';
import PipelineIntelligence from './components/PipelineIntelligence';
import Projects from './components/Projects';
import ThreatModel from './components/ThreatModel';
import Terminal from './components/Terminal';
import { Agent, Vulnerability, ActivityLog, PipelineEvent, DashboardStats, GitLabProject } from './types';
import { Shield, LogOut, Loader2, Database, Terminal as TerminalIcon, ChevronDown, Globe, Plus, AlertCircle, Star, GitFork, Calendar, UserPlus, X } from 'lucide-react';
import seedData from './seed';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projects, setProjects] = useState<GitLabProject[]>([]);
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);
  const [isGitLabConfigured, setIsGitLabConfigured] = useState(true);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pipelines, setPipelines] = useState<PipelineEvent[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    riskScore: 8.4,
    criticalCount: 0,
    highCount: 0,
    mttp: '14m',
    autoFixedCount: 0
  });

  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase not configured - running in demo mode');
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !supabase) {
      setAgents([]);
      setVulnerabilities([]);
      setLogs([]);
      setPipelines([]);
      setProjects([]);
      return;
    }

    const loadData = async () => {
      const { data: agentsData } = await supabase.from('agents').select('*');
      if (agentsData) setAgents(agentsData as Agent[]);

      const { data: vulnsData } = await supabase.from('vulnerabilities').select('*').order('created_at', { ascending: false });
      if (vulnsData) {
        const mapped = vulnsData.map(v => ({
          ...v,
          createdAt: v.created_at,
          updatedAt: v.updated_at
        })) as Vulnerability[];
        const filteredData = selectedProjectId 
          ? mapped.filter(v => v.projectId === selectedProjectId)
          : mapped;
        setVulnerabilities(filteredData);
        
        const critical = filteredData.filter(v => v.severity === 'critical').length;
        const high = filteredData.filter(v => v.severity === 'high').length;
        const fixed = filteredData.filter(v => v.status === 'patched').length;
        
        setStats(prev => ({
          ...prev,
          criticalCount: critical,
          highCount: high,
          autoFixedCount: fixed,
          riskScore: Math.max(0, 10 - (critical * 2 + high * 0.5 + filteredData.length * 0.1))
        }));
      }

      const { data: logsData } = await supabase.from('activity_logs').select('*').order('timestamp', { ascending: false }).limit(50);
      if (logsData) {
        const mapped = logsData.map(l => ({
          ...l,
          timestamp: l.timestamp
        })) as ActivityLog[];
        setLogs(selectedProjectId ? mapped.filter(l => l.projectId === selectedProjectId) : mapped);
      }

      const { data: pipelinesData } = await supabase.from('pipelines').select('*').order('createdAt', { ascending: false }).limit(10);
      if (pipelinesData) {
        const mapped = pipelinesData.map(p => ({
          ...p,
          createdAt: p.createdAt || p.created_at
        })) as PipelineEvent[];
        setPipelines(selectedProjectId ? mapped.filter(p => p.projectId === selectedProjectId) : mapped);
      }

      const { data: projectsData } = await supabase.from('projects').select('*').order('addedAt', { ascending: false });
      if (projectsData) {
        const mapped = projectsData.map(p => ({
          ...p,
          addedAt: p.addedAt || p.added_at,
          firestoreId: p.id
        })) as GitLabProject[];
        setProjects(mapped);
        
        if (!selectedProjectId && mapped.length > 0) {
          setSelectedProjectId(mapped[0].id.toString());
        }
      }
    };

    loadData();

    const channel = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vulnerabilities' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pipelines' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => loadData())
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, selectedProjectId]);

  useEffect(() => {
    if (!user || !supabase) return;

    const fetchGitLabData = async () => {
      if (!selectedProjectId) return;
      try {
        const projectRes = await fetch(`/api/gitlab/project?projectId=${selectedProjectId}`);
        if (!projectRes.ok) {
          const err = await projectRes.json();
          if (err.error === "GitLab configuration missing") {
            setIsGitLabConfigured(false);
          }
          throw new Error(err.error || `HTTP error! status: ${projectRes.status}`);
        }
        setIsGitLabConfigured(true);
        const projectData = await projectRes.json();
        
        setProjects(prev => prev.map(p => p.id === projectData.id ? { ...p, ...projectData } : p));

        const pipelinesRes = await fetch(`/api/gitlab/pipelines?projectId=${selectedProjectId}`);
        if (!pipelinesRes.ok) {
          const err = await pipelinesRes.json();
          throw new Error(err.error || `HTTP error! status: ${pipelinesRes.status}`);
        }
        const pipelinesData = await pipelinesRes.json();
        console.log('GitLab Pipelines:', pipelinesData);
      } catch (error) {
        console.error('Failed to fetch GitLab data:', error instanceof Error ? error.message : String(error));
      }
    };

    fetchGitLabData();
    const interval = setInterval(fetchGitLabData, 30000);
    return () => clearInterval(interval);
  }, [user, selectedProjectId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setAuthError('Supabase not configured');
      return;
    }
    setAuthError('');
    setAuthLoading(true);

    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!supabase) {
      setAuthError('Supabase not configured');
      return;
    }
    setAuthError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`
      }
    });
    if (error) {
      setAuthError(error.message);
    }
  };

  const handleGitLabLogin = async () => {
    if (!supabase) {
      setAuthError('Supabase not configured');
      return;
    }
    setAuthError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'gitlab',
      options: {
        redirectTo: `${window.location.origin}`
      }
    });
    if (error) {
      setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  const handleFindings = async (findings: any[]) => {
    if (!user || !supabase) return;
    
    for (const finding of findings) {
      const newVuln = {
        title: finding.title,
        description: finding.description,
        severity: finding.severity.toLowerCase(),
        status: 'detected',
        file: finding.file,
        projectId: selectedProjectId,
        userId: user.id,
        createdAt: new Date().toISOString(),
        history: [{
          status: 'detected',
          timestamp: new Date().toISOString(),
          message: 'Vulnerability detected during AI scan.',
          agentId: 'Gemini-3-Flash'
        }]
      };
      
      await supabase.from('vulnerabilities').insert(newVuln);
      
      await supabase.from('activity_logs').insert({
        type: 'vulnerability_detected',
        message: `AI Agent identified ${finding.severity} vulnerability in ${finding.file}: ${finding.title}`,
        timestamp: new Date().toISOString(),
        agentId: 'Gemini-3-Flash',
        projectId: selectedProjectId,
        userId: user.id
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gitlab-orange animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 gitlab-bg rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(226,67,41,0.3)]">
          <Shield className="text-white w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 text-center tracking-tight">ASRO Dashboard</h1>
        <p className="text-zinc-500 mb-8 text-center max-w-sm">
          AI-powered security orchestration for GitLab. Connect your account to access the control plane.
        </p>
        
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gitlab-orange"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gitlab-orange"
                required
                minLength={6}
              />
            </div>
            
            {authError && (
              <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {authError}
              </div>
            )}
            
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gitlab-orange text-white font-bold py-3 rounded-lg hover:bg-gitlab-orange/90 transition-all disabled:opacity-50"
            >
              {authLoading ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-zinc-900 px-2 text-zinc-500">or continue with</span>
            </div>
          </div>
          
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-zinc-200 transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          <button
            onClick={handleGitLabLogin}
            className="w-full flex items-center justify-center gap-3 bg-gitlab-orange text-white px-8 py-3 rounded-lg font-bold hover:bg-gitlab-orange/90 transition-all mt-3"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#E24329" d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"/>
            </svg>
            GitLab
          </button>
          
          <p className="text-center text-sm text-zinc-500 mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}
              className="text-gitlab-orange hover:underline font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  const selectedProject = projects.find(p => p.id.toString() === selectedProjectId);

  return (
    <div className="min-h-screen bg-black text-zinc-300 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsProjectSelectorOpen(!isProjectSelectorOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-gitlab-orange" />
                {selectedProject ? selectedProject.path_with_namespace : 'Select Project'}
                <ChevronDown className={`w-3 h-3 transition-transform ${isProjectSelectorOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isProjectSelectorOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-2">
                    {projects.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedProjectId(p.id.toString());
                          setIsProjectSelectorOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg text-left text-xs transition-all ${
                          selectedProjectId === p.id.toString() ? 'bg-gitlab-orange/10 text-gitlab-orange' : 'hover:bg-white/5 text-zinc-400'
                        }`}
                      >
                        <div className="w-6 h-6 bg-white/5 rounded flex items-center justify-center overflow-hidden">
                          {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" /> : <Globe className="w-3 h-3" />}
                        </div>
                        <span className="truncate">{p.path_with_namespace}</span>
                      </button>
                    ))}
                    <button 
                      onClick={() => {
                        setActiveTab('projects');
                        setIsProjectSelectorOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg text-left text-xs text-zinc-500 hover:bg-white/5 transition-all mt-1 border-t border-white/5 pt-3"
                    >
                      <Plus className="w-3 h-3" />
                      Manage Projects
                    </button>
                  </div>
                </div>
              )}
            </div>

            {selectedProject && (
              <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="h-4 w-px bg-white/10"></div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-[10px] font-bold text-zinc-400">{selectedProject.star_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GitFork className="w-3 h-3 text-zinc-500" />
                    <span className="text-[10px] font-bold text-zinc-400">{selectedProject.forks_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-zinc-500" />
                    <span className="text-[10px] font-bold text-zinc-400">
                      {selectedProject.last_activity_at ? new Date(selectedProject.last_activity_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gitlab-orange animate-pulse"></div>
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-tighter">Live Orchestration</span>
            </div>
            
            {!isGitLabConfigured && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">GitLab Token Missing</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsTerminalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gitlab-orange/10 hover:bg-gitlab-orange/20 border border-gitlab-orange/20 rounded-lg text-xs font-medium text-gitlab-orange transition-all"
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              ASRO CLI
            </button>
            <button 
              onClick={() => seedData(selectedProjectId, user)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-all"
            >
              <Database className="w-3.5 h-3.5" />
              Seed Demo Data
            </button>
            <div className="text-right">
              <div className="text-xs font-bold text-white">{user.email?.split('@')[0]}</div>
              <div className="text-[10px] text-zinc-500">{user.email}</div>
            </div>
            {user.user_metadata.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full border border-white/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-full border border-white/10 bg-gitlab-orange flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user.email?.[0]?.toUpperCase()}</span>
              </div>
            )}
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-lg transition-all text-zinc-400 hover:text-red-400"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <SecurityPosture stats={stats} vulnerabilities={vulnerabilities.slice(0, 5)} />
                  <AgentGraph agents={agents} />
                </div>
                <div className="h-[calc(100vh-12rem)]">
                  <ActivityFeed logs={logs} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="max-w-7xl mx-auto h-full">
              <Projects 
                projects={projects} 
                selectedProjectId={selectedProjectId} 
                setSelectedProjectId={setSelectedProjectId}
                user={user}
              />
            </div>
          )}

          {activeTab === 'threat-model' && (
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">AI Threat Modeling</h2>
                <p className="text-zinc-500 mt-1">AI-driven architectural analysis and attack vector prediction.</p>
              </div>
              <ThreatModel projectId={selectedProjectId} />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-7xl mx-auto">
              <SecurityPosture stats={stats} vulnerabilities={vulnerabilities} />
            </div>
          )}

          {activeTab === 'pipelines' && (
            <div className="max-w-7xl mx-auto">
              <PipelineIntelligence pipelines={pipelines} />
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="max-w-7xl mx-auto space-y-8">
              <AgentGraph agents={agents} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {agents.map(agent => (
                  <div key={agent.id} className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                        <TerminalIcon className="w-5 h-5 text-emerald-500" />
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        agent.status === 'busy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-white">{agent.name}</h4>
                    <p className="text-xs text-zinc-500 mt-1">{agent.role}</p>
                    {agent.lastAction && (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Last Action</p>
                        <p className="text-xs text-zinc-300 italic">"{agent.lastAction}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="max-w-3xl mx-auto h-[calc(100vh-12rem)]">
              <ActivityFeed logs={logs} />
            </div>
          )}
          
          {activeTab === 'compliance' && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-zinc-900 border border-white/5 p-12 rounded-3xl flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                  <ShieldCheck className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Compliance & Governance</h3>
                <p className="text-zinc-500 max-w-md mb-8">
                  Automated SOC2, ISO 27001, and HIPAA compliance scoring based on repository state and pipeline history.
                </p>
                <div className="grid grid-cols-3 gap-8 w-full max-w-2xl">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-3xl font-bold text-white mb-1">98%</div>
                    <div className="text-xs text-zinc-500 uppercase font-bold">SOC2 Score</div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-3xl font-bold text-white mb-1">92%</div>
                    <div className="text-xs text-zinc-500 uppercase font-bold">ISO 27001</div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-3xl font-bold text-white mb-1">100%</div>
                    <div className="text-xs text-zinc-500 uppercase font-bold">HIPAA</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Terminal 
        isOpen={isTerminalOpen} 
        onClose={() => setIsTerminalOpen(false)} 
        projectId={selectedProjectId} 
        onFindings={handleFindings}
      />
    </div>
  );
}

import { ShieldCheck } from 'lucide-react';
