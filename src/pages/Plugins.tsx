import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  Package, Plus, Trash2, RefreshCw, Shield, Check, X, 
  ExternalLink, Search, Star, Download, Info, Loader2, 
  Zap, ShieldCheck, RotateCcw, Users, AlertTriangle, 
  Sparkles, Box, ArrowRight
} from 'lucide-react';
import { db } from '../firebase';
import { 
  collection, addDoc, deleteDoc, doc, getDocs, 
  query, where, orderBy, onSnapshot, updateDoc
} from 'firebase/firestore';
import { User } from 'firebase/auth';

interface UserPlugin {
  id: string;
  name: string;
  description: string;
  repoUrl: string;
  version: string;
  latestVersion?: string;
  installedAt: Date;
  verified: boolean;
  userId: string;
  teamId?: string;
  lastVerified?: Date;
  dependencies?: string[];
  dependenciesVerified?: boolean;
  updating?: boolean;
}

interface Recommendation {
  name: string;
  reason: string;
  score: number;
}

interface TeamPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  installedBy: string;
  installedAt: Date;
  userId: string;
}

interface MarketplacePlugin {
  id: string;
  name: string;
  description: string;
  repoUrl: string;
  version: string;
  author: string;
  downloads: number;
  rating: number;
  tags: string[];
  dependencies?: string[];
}

interface UserWithClaims extends User {
  custom_claims?: {
    teamId?: string;
  };
}

const marketplacePlugins: MarketplacePlugin[] = [
  {
    id: '1',
    name: 'security-scanner',
    description: 'Advanced vulnerability scanner with AI-powered detection',
    repoUrl: 'https://github.com/asro-plugins/security-scanner',
    version: '1.2.0',
    author: 'ASRO Team',
    downloads: 1250,
    rating: 4.8,
    tags: ['security', 'scanner', 'AI']
  },
  {
    id: '2',
    name: 'compliance-auditor',
    description: 'SOC2, ISO 27001, and HIPAA compliance monitoring',
    repoUrl: 'https://github.com/asro-plugins/compliance-auditor',
    version: '2.0.0',
    author: 'ASRO Team',
    downloads: 890,
    rating: 4.6,
    tags: ['compliance', 'audit', 'security']
  },
  {
    id: '3',
    name: 'dependency-monitor',
    description: 'Real-time monitoring of npm dependencies for vulnerabilities',
    repoUrl: 'https://github.com/asro-plugins/dependency-monitor',
    version: '1.5.0',
    author: 'Community',
    downloads: 2100,
    rating: 4.9,
    tags: ['dependencies', 'npm', 'monitoring']
  },
  {
    id: '4',
    name: 'secret-detector',
    description: 'Scan codebase for hardcoded secrets, API keys, and tokens',
    repoUrl: 'https://github.com/asro-plugins/secret-detector',
    version: '1.1.0',
    author: 'Security Tools Inc',
    downloads: 567,
    rating: 4.5,
    tags: ['secrets', 'security', 'API']
  },
  {
    id: '5',
    name: 'pipeline-optimizer',
    description: 'Optimize GitLab CI/CD pipelines for security and performance',
    repoUrl: 'https://github.com/asro-plugins/pipeline-optimizer',
    version: '0.9.0',
    author: 'ASRO Team',
    downloads: 340,
    rating: 4.3,
    tags: ['CI/CD', 'pipeline', 'optimization']
  },
  {
    id: '6',
    name: 'threat-modeler',
    description: 'AI-powered threat modeling and attack vector analysis',
    repoUrl: 'https://github.com/asro-plugins/threat-modeler',
    version: '1.0.0',
    author: 'ASRO Team',
    downloads: 678,
    rating: 4.7,
    tags: ['threat', 'AI', 'modeling']
  }
];

async function cliExecute(command: string, args: string[], projectId?: string) {
  const response = await fetch('/api/cli/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command, args, projectId })
  });
  return response.json();
}

export function Plugins({ user }: { user: UserWithClaims | null }) {
  const [activeTab, setActiveTab] = useState<'my-plugins' | 'marketplace' | 'team' | 'recommendations'>('my-plugins');
  const [plugins, setPlugins] = useState<UserPlugin[]>([]);
  const [teamPlugins, setTeamPlugins] = useState<TeamPlugin[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [newPlugin, setNewPlugin] = useState({ name: '', repoUrl: '', description: '', teamId: '' });

  // STEP 1: Real-time Firestore listener for user plugins
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'user_plugins'),
      where('userId', '==', user.uid),
      orderBy('installedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pluginList: UserPlugin[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          repoUrl: data.repoUrl,
          version: data.version,
          latestVersion: data.latestVersion,
          installedAt: data.installedAt?.toDate() || new Date(),
          verified: data.verified || false,
          userId: data.userId,
          teamId: data.teamId,
          lastVerified: data.lastVerified?.toDate(),
          dependencies: data.dependencies || [],
          dependenciesVerified: data.dependenciesVerified || false,
          updating: data.updating || false
        };
      });
      setPlugins(pluginList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // STEP 3: Team plugins listener
  useEffect(() => {
    if (!user?.custom_claims?.teamId) return;

    const q = query(
      collection(db, 'user_plugins'),
      where('teamId', '==', user.custom_claims.teamId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teamList: TeamPlugin[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          version: data.version,
          installedBy: data.userId,
          installedAt: data.installedAt?.toDate() || new Date(),
          userId: data.userId
        };
      });
      setTeamPlugins(teamList);
    });

    return () => unsubscribe();
  }, [user?.custom_claims?.teamId]);

  // STEP 2: Load AI recommendations
  const loadRecommendations = useCallback(async () => {
    setRecommendationsLoading(true);
    try {
      const result = await cliExecute('plugin', ['recommend']);
      if (result.output) {
        setRecommendations(result.output);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
    setRecommendationsLoading(false);
  }, []);

  // STEP 5: Install via CLI + Firebase (with dependencies)
  const installPlugin = async (marketplacePlugin: MarketplacePlugin) => {
    if (!user) return;
    setActionLoading(marketplacePlugin.id);

    try {
      // Call CLI to install
      await cliExecute('plugin', ['install', marketplacePlugin.name, marketplacePlugin.repoUrl]);
      
      // Store in Firebase
      await addDoc(collection(db, 'user_plugins'), {
        name: marketplacePlugin.name,
        description: marketplacePlugin.description,
        repoUrl: marketplacePlugin.repoUrl,
        version: marketplacePlugin.version,
        latestVersion: marketplacePlugin.version,
        installedAt: new Date(),
        verified: false,
        userId: user.uid,
        teamId: user.custom_claims?.teamId || null,
        dependencies: marketplacePlugin.dependencies || [],
        dependenciesVerified: false
      });
    } catch (error) {
      console.error('Failed to install plugin:', error);
    }

    setActionLoading(null);
  };

  const installCustomPlugin = async () => {
    if (!user || !newPlugin.name || !newPlugin.repoUrl) return;
    setActionLoading('custom');

    try {
      await cliExecute('plugin', ['install', newPlugin.name, newPlugin.repoUrl]);
      
      await addDoc(collection(db, 'user_plugins'), {
        name: newPlugin.name,
        description: newPlugin.description || 'Custom plugin',
        repoUrl: newPlugin.repoUrl,
        version: '1.0.0',
        latestVersion: '1.0.0',
        installedAt: new Date(),
        verified: false,
        userId: user.uid,
        teamId: newPlugin.teamId || null,
        dependencies: [],
        dependenciesVerified: false
      });
      setShowInstallModal(false);
      setNewPlugin({ name: '', repoUrl: '', description: '', teamId: '' });
    } catch (error) {
      console.error('Failed to install custom plugin:', error);
    }

    setActionLoading(null);
  };

  // STEP 4: Update plugin via CLI (with auto-update indicator)
  const updatePlugin = async (plugin: UserPlugin) => {
    setActionLoading(`update-${plugin.id}`);

    try {
      // Set updating flag
      await updateDoc(doc(db, 'user_plugins', plugin.id), { updating: true });
      
      await cliExecute('plugin', ['update', plugin.name]);
      
      // Update Firebase with new version
      await updateDoc(doc(db, 'user_plugins', plugin.id), {
        version: plugin.latestVersion || plugin.version,
        updating: false
      });
    } catch (error) {
      console.error('Failed to update plugin:', error);
      await updateDoc(doc(db, 'user_plugins', plugin.id), { updating: false });
    }

    setActionLoading(null);
  };

  // STEP 6: Sync plugins via CLI
  const syncPlugins = useCallback(async () => {
    setSyncing(true);
    try {
      await cliExecute('plugin', ['sync']);
    } catch (error) {
      console.error('Sync failed:', error);
    }
    setSyncing(false);
  }, []);

  // Verify plugin
  const verifyPlugin = async (plugin: UserPlugin) => {
    setActionLoading(`verify-${plugin.id}`);

    try {
      const result = await cliExecute('plugin', ['verify', plugin.name]);
      
      await updateDoc(doc(db, 'user_plugins', plugin.id), {
        verified: true,
        lastVerified: new Date()
      });
    } catch (error) {
      console.error('Verification failed:', error);
    }

    setActionLoading(null);
  };

  const uninstallPlugin = async (pluginId: string, pluginName: string) => {
    setActionLoading(`uninstall-${pluginId}`);

    try {
      await cliExecute('plugin', ['uninstall', pluginName]);
      await deleteDoc(doc(db, 'user_plugins', pluginId));
    } catch (error) {
      console.error('Failed to uninstall plugin:', error);
      // Still remove from UI even if CLI fails
      await deleteDoc(doc(db, 'user_plugins', pluginId));
    }

    setActionLoading(null);
  };

  const isInstalled = (pluginName: string) => 
    plugins.some(p => p.name.toLowerCase() === pluginName.toLowerCase());

  const hasUpdate = (plugin: UserPlugin) => 
    plugin.latestVersion && plugin.latestVersion !== plugin.version;

  const filteredMarketplace = marketplacePlugins.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Package className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Sign in to manage plugins</h2>
          <p className="text-zinc-500">Please sign in to install and manage your plugins.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Plugins</h1>
          <p className="text-zinc-500 mt-1">Extend ASRO with powerful plugins</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={syncPlugins}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all disabled:opacity-50"
          >
            {syncing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            Sync
          </button>
          <button
            onClick={() => setShowInstallModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gitlab-orange text-white rounded-lg font-medium hover:bg-gitlab-orange/90 transition-all"
          >
            <Plus size={18} />
            Install Custom Plugin
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('my-plugins')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'my-plugins' 
              ? 'bg-gitlab-orange/10 text-gitlab-orange border border-gitlab-orange/20' 
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Package size={18} />
          My Plugins
          <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{plugins.length}</span>
        </button>
        <button
          onClick={() => { setActiveTab('recommendations'); loadRecommendations(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'recommendations' 
              ? 'bg-gitlab-orange/10 text-gitlab-orange border border-gitlab-orange/20' 
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles size={18} />
          AI Recommendations
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'team' 
              ? 'bg-gitlab-orange/10 text-gitlab-orange border border-gitlab-orange/20' 
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users size={18} />
          Team Plugins
          <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{teamPlugins.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'marketplace' 
              ? 'bg-gitlab-orange/10 text-gitlab-orange border border-gitlab-orange/20' 
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Download size={18} />
          Marketplace
        </button>
      </div>

      {/* My Plugins Tab */}
      {activeTab === 'my-plugins' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-gitlab-orange animate-spin" />
            </div>
          ) : plugins.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
              <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">No plugins installed</h3>
              <p className="text-zinc-500 mb-4">Browse the marketplace to find plugins</p>
              <button
                onClick={() => setActiveTab('marketplace')}
                className="text-gitlab-orange hover:underline"
              >
                Explore Marketplace →
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {plugins.map((plugin) => (
                <motion.div
                  key={plugin.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gitlab-orange/10 rounded-lg flex items-center justify-center">
                        <Package className="text-gitlab-orange" size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-white">{plugin.name}</h3>
                          {/* STEP 5: Verified Badge */}
                          {plugin.verified && (
                            <span className="flex items-center gap-1 text-xs text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <ShieldCheck size={12} /> Verified
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-500 text-sm mt-1">{plugin.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            v{plugin.version}
                            {hasUpdate(plugin) && (
                              <span className="text-gitlab-orange"> → v{plugin.latestVersion}</span>
                            )}
                          </span>
                          <span>Installed {plugin.installedAt.toLocaleDateString()}</span>
                          {plugin.lastVerified && (
                            <span className="text-emerald-500">Verified {plugin.lastVerified.toLocaleDateString()}</span>
                          )}
                        </div>
                        {/* STEP 4: Dependency UI */}
                        {plugin.dependencies && plugin.dependencies.length > 0 && (
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-xs text-zinc-500">Dependencies:</span>
                            {plugin.dependencies.map(dep => (
                              <span key={dep} className="flex items-center gap-1 text-xs bg-white/5 text-zinc-400 px-2 py-0.5 rounded">
                                <Box size={10} /> {dep}
                              </span>
                            ))}
                            {/* STEP 6: Dependency Warnings */}
                            {!plugin.dependenciesVerified && (
                              <span className="flex items-center gap-1 text-xs text-red-400">
                                <AlertTriangle size={10} /> Unverified
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* STEP 1: Auto-update indicator */}
                      {plugin.updating && (
                        <span className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-sm">
                          <Loader2 size={14} className="animate-spin" /> Updating...
                        </span>
                      )}
                      {/* STEP 2: Version Update UI */}
                      {hasUpdate(plugin) && (
                        <button
                          onClick={() => updatePlugin(plugin)}
                          disabled={actionLoading === `update-${plugin.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-lg text-sm hover:bg-purple-500/20 transition-all disabled:opacity-50"
                        >
                          {actionLoading === `update-${plugin.id}` ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Zap size={14} />
                          )}
                          Update
                        </button>
                      )}
                      {!plugin.verified && (
                        <button
                          onClick={() => verifyPlugin(plugin)}
                          disabled={actionLoading === `verify-${plugin.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white/10 text-zinc-400 rounded-lg text-sm hover:bg-white/20 transition-all disabled:opacity-50"
                          title="Verify plugin security"
                        >
                          {actionLoading === `verify-${plugin.id}` ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <ShieldCheck size={14} />
                          )}
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => window.open(plugin.repoUrl, '_blank')}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        title="View Repository"
                      >
                        <ExternalLink size={18} />
                      </button>
                      <button
                        onClick={() => uninstallPlugin(plugin.id, plugin.name)}
                        disabled={actionLoading === `uninstall-${plugin.id}`}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                        title="Uninstall"
                      >
                        {actionLoading === `uninstall-${plugin.id}` ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {recommendationsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-gitlab-orange animate-spin" />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
              <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">AI Recommendations</h3>
              <p className="text-zinc-500 mb-4">Get personalized plugin suggestions based on your projects</p>
              <button
                onClick={loadRecommendations}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-all mx-auto"
              >
                <Sparkles size={18} />
                Get Recommendations
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Sparkles className="text-purple-500" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{rec.name}</h3>
                        <p className="text-zinc-500 text-sm mt-1">{rec.reason}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-purple-400">Relevance: {rec.score}%</span>
                        </div>
                      </div>
                    </div>
                    {isInstalled(rec.name) ? (
                      <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-sm">
                        <Check size={14} /> Installed
                      </span>
                    ) : (
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-all">
                        Install <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Team Plugins Tab */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          {!user?.custom_claims?.teamId ? (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
              <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">No Team</h3>
              <p className="text-zinc-500 mb-4">Join a team to see shared plugins</p>
              <button className="text-gitlab-orange hover:underline">
                Create or Join a Team →
              </button>
            </div>
          ) : teamPlugins.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
              <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">No team plugins yet</h3>
              <p className="text-zinc-500">Plugins shared by your team will appear here</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {teamPlugins.map((plugin) => (
                <motion.div
                  key={plugin.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <Users className="text-green-500" size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">{plugin.name}</h3>
                          <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">Team</span>
                        </div>
                        <p className="text-zinc-500 text-sm mt-1">{plugin.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                          <span>v{plugin.version}</span>
                          <span>Installed {plugin.installedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-gitlab-orange/10 text-gitlab-orange rounded-lg text-sm hover:bg-gitlab-orange/20 transition-all">
                      <Download size={14} /> Install
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Marketplace Tab */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              placeholder="Search plugins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-gitlab-orange"
            />
          </div>

          {/* Plugin Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {filteredMarketplace.map((plugin) => (
              <motion.div
                key={plugin.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <Package className="text-purple-500" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{plugin.name}</h3>
                      <p className="text-xs text-zinc-500">by {plugin.author}</p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded">v{plugin.version}</span>
                </div>
                
                <p className="text-zinc-400 text-sm mb-4">{plugin.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {plugin.tags.map(tag => (
                    <span key={tag} className="text-xs bg-white/5 text-zinc-400 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Download size={14} /> {plugin.downloads}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500" /> {plugin.rating}
                    </span>
                  </div>
                  
                  {isInstalled(plugin.name) ? (
                    <button
                      disabled
                      className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-sm font-medium cursor-not-allowed"
                    >
                      <Check size={16} /> Installed
                    </button>
                  ) : (
                    <button
                      onClick={() => installPlugin(plugin)}
                      disabled={actionLoading === plugin.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gitlab-orange text-white rounded-lg text-sm font-medium hover:bg-gitlab-orange/90 transition-all disabled:opacity-50"
                    >
                      {actionLoading === plugin.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Download size={16} />
                      )}
                      Install
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Install Custom Plugin Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-white mb-4">Install Custom Plugin</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Plugin Name</label>
                <input
                  type="text"
                  value={newPlugin.name}
                  onChange={(e) => setNewPlugin({ ...newPlugin, name: e.target.value })}
                  placeholder="my-custom-plugin"
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-gitlab-orange"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Repository URL</label>
                <input
                  type="text"
                  value={newPlugin.repoUrl}
                  onChange={(e) => setNewPlugin({ ...newPlugin, repoUrl: e.target.value })}
                  placeholder="https://github.com/user/repo"
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-gitlab-orange"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={newPlugin.description}
                  onChange={(e) => setNewPlugin({ ...newPlugin, description: e.target.value })}
                  placeholder="What does this plugin do?"
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-gitlab-orange"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInstallModal(false)}
                className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={installCustomPlugin}
                disabled={!newPlugin.name || !newPlugin.repoUrl || actionLoading === 'custom'}
                className="flex-1 px-4 py-2 bg-gitlab-orange text-white rounded-lg hover:bg-gitlab-orange/90 transition-all disabled:opacity-50"
              >
                {actionLoading === 'custom' ? <Loader2 className="animate-spin mx-auto" /> : 'Install'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default Plugins;
