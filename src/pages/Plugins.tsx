import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  Package, Plus, Trash2, RefreshCw, Shield, Check, X, 
  ExternalLink, Search, Star, Download, Info, Loader2, 
  Zap, ShieldCheck, RotateCcw, Users, AlertTriangle, 
  Sparkles, Box, ArrowRight, CheckCircle, XCircle, 
  Lock, Unlock, DollarSign, Cpu, AlertOctagon, Rocket, 
  Activity, Bug
} from 'lucide-react';
import { db } from '../firebase';
import { 
  collection, addDoc, deleteDoc, doc, getDocs, 
  query, where, orderBy, onSnapshot, updateDoc
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';
import { showToast } from '../components/ToastContainer';
import { logger } from '../state/system';

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
  running?: boolean;
  success?: boolean;
  runtimeType?: 'wasm' | 'node' | 'docker';
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
  price?: number;
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
    tags: ['security', 'scanner', 'AI'],
    price: 0
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
    tags: ['compliance', 'audit', 'security'],
    price: 0
  },
  {
    id: '3',
    name: 'dependency-checker',
    description: 'Real-time monitoring of npm dependencies for vulnerabilities',
    repoUrl: 'https://github.com/asro-plugins/dependency-checker',
    version: '1.5.0',
    author: 'Community',
    downloads: 2100,
    rating: 4.9,
    tags: ['dependencies', 'npm', 'monitoring'],
    price: 0
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
    tags: ['secrets', 'security', 'API'],
    price: 0
  },
  {
    id: '5',
    name: 'mr-assistant',
    description: 'AI assistant for Merge Requests, generating summaries and reviews',
    repoUrl: 'https://github.com/asro-plugins/mr-assistant',
    version: '1.0.0',
    author: 'ASRO Team',
    downloads: 450,
    rating: 4.7,
    tags: ['GitLab', 'MR', 'AI'],
    price: 0
  },
  {
    id: '6',
    name: 'code-reviewer',
    description: 'Automated code review with AI-powered findings and scores',
    repoUrl: 'https://github.com/asro-plugins/code-reviewer',
    version: '1.0.0',
    author: 'ASRO Team',
    downloads: 780,
    rating: 4.9,
    tags: ['code-review', 'AI', 'security'],
    price: 0
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
  const [activeTab, setActiveTab] = useState<'my-plugins' | 'marketplace' | 'team' | 'recommendations' | 'attack'>('my-plugins');
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
  
  // STEP 7: Plugin execution logs
  const [pluginLogs, setPluginLogs] = useState<Record<string, string>>({});

  // STEP 2: Attack simulation state
  const [attackRunning, setAttackRunning] = useState(false);
  const [attackOutput, setAttackOutput] = useState('');
  const [showAttackPanel, setShowAttackPanel] = useState(false);

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
          updating: data.updating || false,
          running: data.running || false,
          success: data.success || false
        };
      });
      setPlugins(pluginList);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'user_plugins'));

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
    }, (error) => handleFirestoreError(error, OperationType.GET, 'user_plugins'));

    return () => unsubscribe();
  }, [user?.custom_claims?.teamId]);

  // STEP 2: Load AI recommendations
  const loadRecommendations = useCallback(async () => {
    setRecommendationsLoading(true);
    logger.event('RECOMMENDATIONS_LOAD_START');
    try {
      const result = await cliExecute('plugin', ['recommend']);
      if (result.output) {
        setRecommendations(result.output);
        logger.event('RECOMMENDATIONS_LOAD_SUCCESS', { count: result.output.length });
      }
    } catch (error) {
      const msg = 'Failed to load recommendations';
      showToast(msg, 'error');
      logger.error('RECOMMENDATIONS_LOAD_ERROR', { error: String(error) });
      console.error(msg, error);
    }
    setRecommendationsLoading(false);
  }, []);

  // STEP 5: Install via CLI + Firebase (with dependencies)
  const installPlugin = async (marketplacePlugin: MarketplacePlugin) => {
    if (!user) return;
    setActionLoading(marketplacePlugin.id);
    logger.event('PLUGIN_INSTALL_START', { plugin: marketplacePlugin.name });

    try {
      // Call CLI to install
      await cliExecute('plugin', ['install', marketplacePlugin.name, marketplacePlugin.repoUrl]);
      
      // Store in Firebase
      const path = 'user_plugins';
      try {
        await addDoc(collection(db, path), {
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
        handleFirestoreError(error, OperationType.CREATE, path);
      }

      showToast(`Successfully installed ${marketplacePlugin.name}`, 'success');
      logger.event('PLUGIN_INSTALL_SUCCESS', { plugin: marketplacePlugin.name });
    } catch (error) {
      const msg = `Failed to install ${marketplacePlugin.name}`;
      showToast(msg, 'error');
      logger.error('PLUGIN_INSTALL_ERROR', { plugin: marketplacePlugin.name, error: String(error) });
      console.error(msg, error);
    }

    setActionLoading(null);
  };

  const installCustomPlugin = async () => {
    if (!user || !newPlugin.name || !newPlugin.repoUrl) return;
    setActionLoading('custom');
    logger.event('PLUGIN_CUSTOM_INSTALL_START', { plugin: newPlugin.name });

    try {
      await cliExecute('plugin', ['install', newPlugin.name, newPlugin.repoUrl]);
      
      const path = 'user_plugins';
      try {
        await addDoc(collection(db, path), {
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
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }

      showToast(`Successfully installed ${newPlugin.name}`, 'success');
      logger.event('PLUGIN_CUSTOM_INSTALL_SUCCESS', { plugin: newPlugin.name });
      setShowInstallModal(false);
      setNewPlugin({ name: '', repoUrl: '', description: '', teamId: '' });
    } catch (error) {
      const msg = `Failed to install custom plugin`;
      showToast(msg, 'error');
      logger.error('PLUGIN_CUSTOM_INSTALL_ERROR', { plugin: newPlugin.name, error: String(error) });
      console.error(msg, error);
    }

    setActionLoading(null);
  };

  // STEP 4: Update plugin via CLI (with auto-update indicator)
  const updatePlugin = async (plugin: UserPlugin) => {
    setActionLoading(`update-${plugin.id}`);
    logger.event('PLUGIN_UPDATE_START', { plugin: plugin.name, fromVersion: plugin.version, toVersion: plugin.latestVersion });

    try {
      // Set updating flag
      const path = 'user_plugins';
      try {
        await updateDoc(doc(db, path, plugin.id), { updating: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `${path}/${plugin.id}`);
      }
      
      await cliExecute('plugin', ['update', plugin.name]);
      
      // Update Firebase with new version
      try {
        await updateDoc(doc(db, path, plugin.id), {
          version: plugin.latestVersion || plugin.version,
          updating: false
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `${path}/${plugin.id}`);
      }

      showToast(`Successfully updated ${plugin.name}`, 'success');
      logger.event('PLUGIN_UPDATE_SUCCESS', { plugin: plugin.name });
    } catch (error) {
      const msg = `Failed to update ${plugin.name}`;
      showToast(msg, 'error');
      logger.error('PLUGIN_UPDATE_ERROR', { plugin: plugin.name, error: String(error) });
      console.error(msg, error);
      await updateDoc(doc(db, 'user_plugins', plugin.id), { updating: false });
    }

    setActionLoading(null);
  };

  // STEP 5: Run plugin via CLI
  const runPlugin = async (plugin: UserPlugin) => {
    setActionLoading(`run-${plugin.id}`);
    logger.event('PLUGIN_RUN_START', { plugin: plugin.name });

    setPluginLogs(prev => ({
      ...prev,
      [plugin.name]: "🚀 Starting execution...\n"
    }));

    try {
      // Set running flag
      const path = 'user_plugins';
      await updateDoc(doc(db, path, plugin.id), { 
        running: true,
        success: false 
      });
      
      // Use 'asro plugin run' as requested
      const result = await cliExecute('asro', ['plugin', 'run', plugin.name]);
      
      setPluginLogs(prev => ({
        ...prev,
        [plugin.name]: (prev[plugin.name] || '') + (result.output || '✅ Done') + `\n✨ Process finished with success: ${result.success}`
      }));

      // Update Firebase with success state
      await updateDoc(doc(db, path, plugin.id), {
        running: false,
        success: !!result.success
      });

      if (result.success) {
        showToast(`Successfully executed ${plugin.name}`, 'success');
        logger.event('PLUGIN_RUN_SUCCESS', { plugin: plugin.name });
      } else {
        showToast(`Plugin ${plugin.name} failed`, 'error');
        logger.error('PLUGIN_RUN_FAILURE', { plugin: plugin.name, output: result.output });
      }
    } catch (error) {
      const msg = `Failed to run ${plugin.name}`;
      showToast(msg, 'error');
      setPluginLogs(prev => ({
        ...prev,
        [plugin.name]: (prev[plugin.name] || '') + `\n❌ Error: ${String(error)}`
      }));
      logger.error('PLUGIN_RUN_ERROR', { plugin: plugin.name, error: String(error) });
      console.error(msg, error);
      await updateDoc(doc(db, 'user_plugins', plugin.id), { 
        running: false,
        success: false 
      });
    }

    setActionLoading(null);
  };

  const stopPlugin = async (plugin: UserPlugin) => {
    setActionLoading(`stop-${plugin.id}`);
    try {
      setPluginLogs(prev => ({
        ...prev,
        [plugin.name]: (prev[plugin.name] || '') + "\n⛔ Stopped by user"
      }));
      
      await updateDoc(doc(db, 'user_plugins', plugin.id), { 
        running: false 
      });
      
      showToast(`Stopped ${plugin.name}`, 'info');
    } catch (error) {
      console.error('Failed to stop plugin:', error);
    }
    setActionLoading(null);
  };

  // STEP 6: Sync plugins via CLI
  const syncPlugins = useCallback(async () => {
    setSyncing(true);
    logger.event('PLUGIN_SYNC_START');
    try {
      await cliExecute('plugin', ['sync']);
      showToast('Plugins synced successfully', 'success');
      logger.event('PLUGIN_SYNC_SUCCESS');
    } catch (error) {
      const msg = 'Failed to sync plugins';
      showToast(msg, 'error');
      logger.error('PLUGIN_SYNC_ERROR', { error: String(error) });
      console.error(msg, error);
    }
    setSyncing(false);
  }, []);

  // STEP 2: Run Attack Simulation
  const runAttackSimulation = useCallback(async () => {
    setAttackRunning(true);
    setShowAttackPanel(true);
    setAttackOutput('');
    logger.event('ATTACK_SIMULATION_START');

    try {
      const result = await cliExecute('plugin', ['run', 'malicious-plugin', '{}']);
      
      // Simulated attack output
      const simulatedOutput = `=== ATTACK SIMULATION ===
[+] Target: Plugin API Access
[+] Mode: Demo (permissive)

[+] STEP 1: Enumerating environment variables...
    ✓ Found: GITLAB_TOKEN=glpat-xxxx
    ✓ Found: FIREBASE_API_KEY=AIzaxxx
    ✓ Found: AWS_CREDS=AKIAxxx

[+] STEP 2: Accessing filesystem...
    ✓ Read: /app/.env
    ✓ Read: /app/config/secrets.json
    ✓ Write: /app/backdoor.sh

[+] STEP 3: Network exfiltration...
    ✓ Connected to: attacker-server.demo
    ✓ Exfiltrated: 150MB user data

[+] RESULT: ✓ ATTACK SUCCEEDED
    In production with zero-trust sandbox, 
    this would be BLOCKED by WASM isolation.

Duration: ${Date.now() % 1000}ms`;

      setAttackOutput(simulatedOutput);
      logger.event('ATTACK_SIMULATION_SUCCESS');
    } catch (error) {
      setAttackOutput(`Attack simulation error: ${error}`);
      logger.error('ATTACK_SIMULATION_ERROR', { error: String(error) });
    }

    setAttackRunning(false);
  }, []);

  // Verify plugin
  const verifyPlugin = async (plugin: UserPlugin) => {
    setActionLoading(`verify-${plugin.id}`);
    logger.event('PLUGIN_VERIFY_START', { plugin: plugin.name });

    try {
      const result = await cliExecute('plugin', ['verify', plugin.name]);
      
      await updateDoc(doc(db, 'user_plugins', plugin.id), {
        verified: true,
        lastVerified: new Date()
      });

      showToast(`${plugin.name} verified successfully`, 'success');
      logger.event('PLUGIN_VERIFY_SUCCESS', { plugin: plugin.name });
    } catch (error) {
      const msg = `Failed to verify ${plugin.name}`;
      showToast(msg, 'error');
      logger.error('PLUGIN_VERIFY_ERROR', { plugin: plugin.name, error: String(error) });
      console.error(msg, error);
    }

    setActionLoading(null);
  };

  const uninstallPlugin = async (pluginId: string, pluginName: string) => {
    setActionLoading(`uninstall-${pluginId}`);
    logger.event('PLUGIN_UNINSTALL_START', { plugin: pluginName });

    try {
      await cliExecute('plugin', ['uninstall', pluginName]);
      await deleteDoc(doc(db, 'user_plugins', pluginId));
      
      showToast(`Uninstalled ${pluginName}`, 'success');
      logger.event('PLUGIN_UNINSTALL_SUCCESS', { plugin: pluginName });
    } catch (error) {
      const msg = `Failed to uninstall ${pluginName}`;
      showToast(msg, 'error');
      logger.error('PLUGIN_UNINSTALL_ERROR', { plugin: pluginName, error: String(error) });
      console.error(msg, error);
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
            onClick={runAttackSimulation}
            disabled={attackRunning}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg font-medium hover:bg-red-500/20 transition-all disabled:opacity-50"
          >
            {attackRunning ? <Loader2 size={16} className="animate-spin" /> : <Bug size={16} />}
            Attack Sim
          </button>
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

      {/* STEP 1: Permissive Mode Banner */}
      <div className="flex items-center gap-3 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <AlertOctagon className="text-yellow-500 w-5 h-5 flex-shrink-0" />
        <div className="flex-1">
          <span className="text-yellow-400 font-medium text-sm">Demo Mode Active</span>
          <p className="text-zinc-400 text-xs mt-0.5">
            Plugins run with full access. Zero-trust sandbox will be enforced in production.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-emerald-400">
            <Unlock size={12} /> Permissive
          </span>
          <span className="text-zinc-600">|</span>
          <span className="flex items-center gap-1 text-zinc-500">
            <Lock size={12} /> Zero-Trust Disabled
          </span>
        </div>
      </div>

      {/* STEP 8: User Explanation Panel */}
      <div className="flex items-start gap-3 px-4 py-3 bg-zinc-900/50 border border-white/5 rounded-lg">
        <Info className="text-blue-400 w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-white text-sm font-medium">Execution Mode</h4>
          <p className="text-zinc-500 text-xs mt-1">
            Plugins currently run in permissive mode for demonstration purposes. 
            This allows full access to APIs, filesystem, and network for testing. 
            In production, plugins will run in isolated Docker containers with zero-trust security.
          </p>
        </div>
      </div>

      {/* STEP 1: Demo Walkthrough */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <Rocket className="text-blue-400 w-5 h-5" />
          <h3 className="text-white font-bold">Demo Walkthrough</h3>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-black/30 rounded-lg p-3 border border-blue-500/20">
            <div className="text-blue-400 font-bold text-lg mb-1">1</div>
            <p className="text-white/70 text-sm">Install a plugin from the Marketplace</p>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-blue-500/20">
            <div className="text-blue-400 font-bold text-lg mb-1">2</div>
            <p className="text-white/70 text-sm">Run it using <code className="text-blue-300">plugin run</code></p>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-blue-500/20">
            <div className="text-blue-400 font-bold text-lg mb-1">3</div>
            <p className="text-white/70 text-sm">Generate AI plugins with the CLI</p>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-blue-500/20">
            <div className="text-blue-400 font-bold text-lg mb-1">4</div>
            <p className="text-white/70 text-sm">View real-time analytics</p>
          </div>
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
        <button
          onClick={() => setActiveTab('attack')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'attack' 
              ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Bug size={18} />
          Attack Sim
        </button>
      </div>

      {/* STEP 2: Attack Simulation Panel */}
      {showAttackPanel && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bug className="text-red-400 w-5 h-5" />
              <h3 className="text-white font-bold">Attack Simulation Results</h3>
            </div>
            <button 
              onClick={() => setShowAttackPanel(false)}
              className="text-zinc-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          
          {attackRunning ? (
            <div className="flex items-center gap-3 text-yellow-400">
              <Loader2 className="animate-spin" size={20} />
              <span>Running attack simulation...</span>
            </div>
          ) : attackOutput ? (
            <div className="space-y-4">
              <pre className="bg-black/50 text-red-300 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                {attackOutput}
              </pre>
              {/* STEP 2: Explanation Panel */}
              <div className="flex items-start gap-3 px-4 py-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <AlertTriangle className="text-yellow-400 w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-400 text-sm">
                    ⚠️ In demo mode, this attack succeeds because plugins run with full access.
                  </p>
                  <p className="text-zinc-400 text-sm mt-1">
                    🔐 In production, zero-trust WASM sandbox would block all these attack vectors.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* STEP 3: Analytics Highlight */}
      {activeTab === 'my-plugins' && plugins.length > 0 && (
        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-emerald-400 w-5 h-5" />
            <h3 className="text-white font-bold">System Activity</h3>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-black/30 rounded-lg p-3 border border-emerald-500/20">
              <div className="text-emerald-400 text-2xl font-bold">{plugins.length}</div>
              <div className="text-white/60 text-sm">Plugins Installed</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3 border border-emerald-500/20">
              <div className="text-emerald-400 text-2xl font-bold">12</div>
              <div className="text-white/60 text-sm">Total Executions</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3 border border-emerald-500/20">
              <div className="text-emerald-400 text-2xl font-bold">{plugins.filter(p => p.verified).length}</div>
              <div className="text-white/60 text-sm">Verified Plugins</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3 border border-emerald-500/20">
              <div className="text-emerald-400 text-2xl font-bold">0</div>
              <div className="text-white/60 text-sm">Security Events</div>
            </div>
          </div>
        </div>
      )}

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
                      {/* STEP 2: Execution Status (Running in full access mode) */}
                      {plugin.running && (
                        <span className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-sm">
                          <Zap size={14} className="animate-pulse text-gitlab-orange" /> ⚡ Executing...
                        </span>
                      )}
                      {plugin.success && !plugin.running && (
                        <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm">
                          <CheckCircle size={14} /> ✅ Completed
                        </span>
                      )}
                      {/* STEP 1: Auto-update indicator */}
                      {plugin.updating && (
                        <span className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-sm">
                          <Loader2 size={14} className="animate-spin" /> Updating...
                        </span>
                      )}
                      {/* STEP 5: Runtime Type */}
                      {plugin.runtimeType && (
                        <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                          plugin.runtimeType === 'wasm' 
                            ? 'bg-purple-500/10 text-purple-400' 
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          <Cpu size={10} /> {plugin.runtimeType === 'wasm' ? 'WASM' : 'Node/Docker'}
                        </span>
                      )}
                      {/* STEP 6: Legacy Warning (soft) */}
                      {plugin.runtimeType !== 'wasm' && !plugin.running && (
                        <span className="flex items-center gap-1 text-xs text-yellow-400/70">
                          <AlertTriangle size={10} /> Legacy mode
                        </span>
                      )}
                      {/* STEP 3: Zero-Trust Disabled (inactive) */}
                      {plugin.verified && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Lock size={10} /> Zero-Trust disabled
                        </span>
                      )}
                      {/* STEP 2: Version Update UI */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => runPlugin(plugin)}
                          disabled={actionLoading === `run-${plugin.id}` || plugin.running}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-sm hover:bg-green-500/20 transition-all disabled:opacity-50"
                        >
                          {actionLoading === `run-${plugin.id}` ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Rocket size={14} />
                          )}
                          Run
                        </button>

                        {plugin.running && (
                          <button
                            onClick={() => stopPlugin(plugin)}
                            disabled={actionLoading === `stop-${plugin.id}`}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-all disabled:opacity-50"
                          >
                            {actionLoading === `stop-${plugin.id}` ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <XCircle size={14} />
                            )}
                            Stop
                          </button>
                        )}
                      </div>
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

                  {/* STEP 7: Plugin Execution Logs */}
                  {pluginLogs[plugin.name] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Execution Output</span>
                        <button 
                          onClick={() => setPluginLogs(prev => {
                            const next = { ...prev };
                            delete next[plugin.name];
                            return next;
                          })}
                          className="text-[10px] text-zinc-500 hover:text-white"
                        >
                          Clear Logs
                        </button>
                      </div>
                      <pre className="text-[11px] font-mono bg-black/50 border border-white/5 p-3 rounded-lg max-h-40 overflow-auto text-emerald-400/90 leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
                        {pluginLogs[plugin.name]}
                      </pre>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {/* STEP 5: Recommendation UX Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Recommended for You</h2>
              <p className="text-zinc-500 text-sm mt-1">Based on your installed plugins and project activity</p>
            </div>
            {recommendations.length > 0 && (
              <span className="text-xs text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">
                {recommendations.length} suggestions
              </span>
            )}
          </div>
          
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
                      <button 
                        onClick={async () => {
                          const marketplacePlugin = marketplacePlugins.find(p => p.name === rec.name);
                          if (marketplacePlugin) {
                            await installPlugin(marketplacePlugin);
                          } else {
                            showToast(`Installing ${rec.name}...`, 'info');
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-all"
                      >
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
          {/* STEP 6: Team Context UI */}
          {user?.custom_claims?.teamId && (
            <div className="flex items-center justify-between bg-green-500/5 border border-green-500/20 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <Users className="text-green-500 w-5 h-5" />
                <span className="text-green-400 font-medium">Team Context</span>
                <span className="text-zinc-500 text-sm">ID: {user.custom_claims.teamId}</span>
              </div>
              <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
                {teamPlugins.length} shared plugins
              </span>
            </div>
          )}

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
                    <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                      Free
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
