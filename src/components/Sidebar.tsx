import React from 'react';
import { LayoutDashboard, ShieldAlert, GitBranch, Terminal, Settings, Activity, ShieldCheck, Globe, Info, BookOpen, Package } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'security-dashboard', label: 'Security Dashboard', icon: ShieldAlert },
    { id: 'compliance-dashboard', label: 'Compliance', icon: ShieldCheck },
    { id: 'analytics-dashboard', label: 'Analytics', icon: Activity },
    { id: 'projects', label: 'Projects', icon: Globe },
    { id: 'threat-model', label: 'Threat Model', icon: ShieldAlert },
    { id: 'agents', label: 'AI Orchestration', icon: Terminal },
    { id: 'security', label: 'Security Posture', icon: ShieldAlert },
    { id: 'pipelines', label: 'CI/CD Intelligence', icon: GitBranch },
    { id: 'activity', label: 'Activity Feed', icon: Activity },
    { id: 'plugins', label: 'Plugins', icon: Package },
    { id: 'help', label: 'Help', icon: BookOpen },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className="w-64 bg-zinc-950 border-r border-white/5 h-screen flex flex-col sticky top-0">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gitlab-orange rounded-lg flex items-center justify-center">
            <ShieldAlert className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-white">ASRO</h1>
        </div>
        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-medium">AI Security Orchestration</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-gitlab-orange/10 text-gitlab-orange border border-gitlab-orange/20'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
