import React from 'react';
import { User, Mail, Shield, Calendar, Activity, Clock, LogOut, ExternalLink, ShieldCheck, Key } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileProps {
  user: {
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    uid: string;
    metadata?: {
      creationTime?: string;
      lastSignInTime?: string;
    };
  };
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="h-32 bg-gradient-to-r from-gitlab-orange to-gitlab-purple relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-full border-4 border-zinc-950 overflow-hidden bg-zinc-900 shadow-xl">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                  <User className="w-10 h-10 text-zinc-600" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{user.displayName || 'Security Orchestrator'}</h2>
              <p className="text-zinc-500 flex items-center gap-2 mt-1">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onLogout}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs font-bold text-red-500 transition-all flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <Shield className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Security Clearance</span>
              </div>
              <p className="text-lg font-bold text-white">Level 4 (Admin)</p>
            </div>
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Member Since</span>
              </div>
              <p className="text-lg font-bold text-white">
                {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Mar 2026'}
              </p>
            </div>
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Last Activity</span>
              </div>
              <p className="text-lg font-bold text-white">
                {user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleTimeString() : 'Just now'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gitlab-orange" />
            Security Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">Two-Factor Authentication</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Enhanced account protection</p>
              </div>
              <div className="w-10 h-5 bg-emerald-500/20 border border-emerald-500/30 rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-emerald-500 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">AI Auto-Remediation</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Allow agents to propose fixes</p>
              </div>
              <div className="w-10 h-5 bg-emerald-500/20 border border-emerald-500/30 rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-emerald-500 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">GitLab Sync</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Real-time pipeline monitoring</p>
              </div>
              <div className="w-10 h-5 bg-emerald-500/20 border border-emerald-500/30 rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-emerald-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-gitlab-purple" />
            API Access & Integrations
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gitlab-orange/10 rounded-lg flex items-center justify-center">
                  <ExternalLink className="w-4 h-4 text-gitlab-orange" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">GitLab Personal Access Token</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Configured via environment</p>
                </div>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gitlab-purple/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-gitlab-purple" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Gemini AI Engine</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Active & Optimized</p>
                </div>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all uppercase tracking-widest">
            Manage Integrations
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
