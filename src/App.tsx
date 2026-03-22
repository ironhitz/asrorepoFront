import React, { useState, useEffect, Component } from 'react';
import { collection, onSnapshot, query, orderBy, limit, doc, getDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { GoogleGenAI } from "@google/genai";
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
import { Shield, LogIn, Loader2, Database, Terminal as TerminalIcon, ChevronDown, Globe, Plus, AlertCircle, Star, GitFork, Calendar } from 'lucide-react';
import seedData from './seed';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projects, setProjects] = useState<GitLabProject[]>([]);
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);
  const [isGitLabConfigured, setIsGitLabConfigured] = useState(true);

  // Data State
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

  const updateVulnerabilityHistory = async (vulnId: string, status: string, message: string, agentId?: string) => {
    try {
      const vulnRef = doc(db, 'vulnerabilities', vulnId);
      const vulnSnap = await getDoc(vulnRef);
      if (vulnSnap.exists()) {
        const currentHistory = vulnSnap.data().history || [];
        const newHistoryItem = {
          status,
          timestamp: new Date().toISOString(),
          message,
          agentId
        };
        await updateDoc(vulnRef, {
          status,
          history: [...currentHistory, newHistoryItem]
        });
      }
    } catch (error) {
      console.error("Error updating vulnerability history:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Listen to Agents
    const qAgents = query(collection(db, 'agents'));
    const unsubAgents = onSnapshot(qAgents, (snapshot) => {
      setAgents(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Agent)));
    });

    // Listen to Vulnerabilities
    const qVulns = query(collection(db, 'vulnerabilities'), orderBy('createdAt', 'desc'));
    const unsubVulns = onSnapshot(qVulns, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Vulnerability));
      
      // Filter by project if selected
      const filteredData = selectedProjectId 
        ? data.filter(v => v.projectId === selectedProjectId)
        : data;

      setVulnerabilities(filteredData);
      
      // Update stats based on data
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
    });

    // Listen to Activity Logs
    const qLogs = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(50));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ActivityLog));
      setLogs(selectedProjectId ? data.filter(l => l.projectId === selectedProjectId) : data);
    });

    // Listen to Pipelines
    const qPipelines = query(collection(db, 'pipelines'), orderBy('createdAt', 'desc'), limit(10));
    const unsubPipelines = onSnapshot(qPipelines, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PipelineEvent));
      setPipelines(selectedProjectId ? data.filter(p => p.projectId === selectedProjectId) : data);
    });

    // Listen to Projects
    const qProjects = query(collection(db, 'projects'), orderBy('addedAt', 'desc'));
    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        ...doc.data(), 
        firestoreId: doc.id,
        id: parseInt(doc.data().id)
      } as GitLabProject));
      setProjects(data);
      
      // If no project selected, pick the first one
      if (!selectedProjectId && data.length > 0) {
        setSelectedProjectId(data[0].id.toString());
      }
    });

    return () => {
      unsubAgents();
      unsubVulns();
      unsubLogs();
      unsubPipelines();
      unsubProjects();
    };
  }, [user, selectedProjectId]);

  // Fetch real GitLab data
  useEffect(() => {
    if (!user) return;

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
        
        // Update project info in list if needed
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
    const interval = setInterval(fetchGitLabData, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [user, selectedProjectId]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleFindings = async (findings: any[]) => {
    for (const finding of findings) {
      const newVuln = {
        title: finding.title,
        description: finding.description,
        severity: finding.severity.toLowerCase(),
        status: 'detected',
        file: finding.file,
        projectId: selectedProjectId,
        createdAt: new Date().toISOString(),
        history: [{
          status: 'detected',
          timestamp: new Date().toISOString(),
          message: 'Vulnerability detected during AI scan.',
          agentId: 'Gemini-3-Flash'
        }]
      };
      await addDoc(collection(db, 'vulnerabilities'), newVuln);
      
      // Also log this activity
      await addDoc(collection(db, 'activity_logs'), {
        type: 'vulnerability_detected',
        message: `AI Agent identified ${finding.severity} vulnerability in ${finding.file}: ${finding.title}`,
        timestamp: new Date().toISOString(),
        agentId: 'Gemini-3-Flash',
        projectId: selectedProjectId
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
        <button
          onClick={handleLogin}
          className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-all active:scale-95"
        >
          <LogIn className="w-5 h-5" />
          Sign in with Google
        </button>
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
              onClick={() => seedData(selectedProjectId)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-all"
            >
              <Database className="w-3.5 h-3.5" />
              Seed Demo Data
            </button>
            <div className="text-right">
              <div className="text-xs font-bold text-white">{user.displayName}</div>
              <div className="text-[10px] text-zinc-500">{user.email}</div>
            </div>
            <img 
              src={user.photoURL || ''} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full border border-white/10"
              referrerPolicy="no-referrer"
            />
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
                        <Terminal className="w-5 h-5 text-emerald-500" />
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
