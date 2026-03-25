import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Terminal, Shield, Package, Sparkles, GitBranch, Search, 
  Code, Settings, BookOpen, ChevronRight, Copy, Check,
  ExternalLink, Zap, Bot, Layers, Server
} from 'lucide-react';

const categories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    description: 'Quick start guides and basic concepts'
  },
  {
    id: 'commands',
    title: 'CLI Commands',
    icon: Terminal,
    description: 'Complete command reference'
  },
  {
    id: 'plugins',
    title: 'Plugin System',
    icon: Package,
    description: 'Extend ASRO functionality'
  },
  {
    id: 'ai',
    title: 'AI Features',
    icon: Sparkles,
    description: 'AI-powered security scanning'
  },
  {
    id: 'api',
    title: 'API Reference',
    icon: Server,
    description: 'Backend API documentation'
  }
];

const commandDocs = [
  {
    command: 'asro help',
    description: 'Show all available commands',
    usage: 'asro help',
    example: 'asro help'
  },
  {
    command: 'asro version',
    description: 'Display CLI version and build info',
    usage: 'asro version',
    example: 'asro version'
  },
  {
    command: 'asro config',
    description: 'Show current configuration',
    usage: 'asro config',
    example: 'asro config'
  },
  {
    command: 'asro doctor',
    description: 'Run health check on repository and services',
    usage: 'asro doctor',
    example: 'asro doctor'
  },
  {
    command: 'asro commit',
    description: 'Create AI-enhanced git commit',
    usage: 'asro commit [message]',
    example: 'asro commit Fixed authentication bug'
  },
  {
    command: 'asro push',
    description: 'Push changes and trigger GitLab pipeline',
    usage: 'asro push [branch]',
    example: 'asro push origin main'
  },
  {
    command: 'asro scan',
    description: 'Scan repository for vulnerabilities',
    usage: 'asro scan [path]',
    example: 'asro scan src/'
  },
  {
    command: 'asro patch',
    description: 'Generate security patch for vulnerability',
    usage: 'asro patch <description>',
    example: 'asro patch SQL injection in user query'
  },
  {
    command: 'asro pipeline',
    description: 'Manage GitLab pipelines',
    usage: 'asro pipeline [run|list]',
    example: 'asro pipeline run'
  },
  {
    command: 'asro agents',
    description: 'List and manage AI agents',
    usage: 'asro agents [run]',
    example: 'asro agents run scanner'
  },
  {
    command: 'asro plugin',
    description: 'Plugin management commands',
    usage: 'asro plugin <install|uninstall|list|verify> [args]',
    example: 'asro plugin list'
  },
  {
    command: 'asro generate plugin',
    description: 'Generate plugin using AI',
    usage: 'asro generate plugin <description>',
    example: 'asro generate plugin security audit tool'
  },
  {
    command: 'asro whoami',
    description: 'Show current GitLab user info',
    usage: 'asro whoami',
    example: 'asro whoami'
  },
  {
    command: 'asro repo',
    description: 'Show repository information',
    usage: 'asro repo',
    example: 'asro repo'
  }
];

const setupSteps = [
  {
    step: 1,
    title: 'Install Dependencies',
    description: 'Clone the repository and install npm packages',
    command: 'npm install'
  },
  {
    step: 2,
    title: 'Configure Environment',
    description: 'Set up your GitLab token and API keys',
    command: 'cp .env.example .env'
  },
  {
    step: 3,
    title: 'Start Server',
    description: 'Run the development server',
    command: 'npm run dev'
  },
  {
    step: 4,
    title: 'Open Terminal',
    description: 'Click the terminal icon in the bottom-right corner',
    command: ''
  }
];

const pluginExample = `// my-plugin/index.js
export default {
  name: "my-plugin",
  version: "1.0.0",
  commands: {
    greet: async (context, args) => {
      const name = args[0] || "User";
      return { 
        success: true, 
        output: \`Hello, \${name}!\` 
      };
    }
  }
};`;

export function Help() {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [copiedCommand, setCopiedCommand] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(text);
    setTimeout(() => setCopiedCommand(''), 2000);
  };

  return (
    <motion.div 
      className="flex gap-6 h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Sidebar */}
      <div className="w-72 shrink-0 space-y-2">
        <h1 className="text-2xl font-bold text-white mb-6 px-4">Help Center</h1>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeCategory === cat.id 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <cat.icon size={20} />
            <span className="font-medium">{cat.title}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-4">
        {activeCategory === 'getting-started' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Getting Started</h2>
              <p className="text-white/60 mb-8">
                Get up and running with ASRO CLI in minutes. Follow these steps to set up your environment.
              </p>
            </div>

            {/* Setup Steps */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Quick Setup</h3>
              {setupSteps.map((item) => (
                <div 
                  key={item.step}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold shrink-0">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-white/60 text-sm mb-2">{item.description}</p>
                      {item.command && (
                        <code className="text-xs bg-black/50 text-orange-400 px-2 py-1 rounded">
                          {item.command}
                        </code>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Environment Variables */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Environment Variables</h3>
              <div className="space-y-3 font-mono text-sm">
                {[
                  { key: 'GITLAB_TOKEN', desc: 'GitLab personal access token (required)' },
                  { key: 'GITLAB_PROJECT_ID', desc: 'Default project ID' },
                  { key: 'GEMINI_API_KEY', desc: 'Google Gemini API key (for AI features)' },
                  { key: 'TENANT_ID', desc: 'Multi-tenant identifier (optional)' }
                ].map((env) => (
                  <div key={env.key} className="flex gap-4">
                    <span className="text-orange-400 shrink-0">{env.key}</span>
                    <span className="text-white/60">{env.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeCategory === 'commands' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">CLI Commands</h2>
              <p className="text-white/60 mb-8">
                Complete reference for all available commands. Run these in the terminal.
              </p>
            </div>

            <div className="space-y-3">
              {commandDocs.map((cmd) => (
                <div 
                  key={cmd.command}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <code className="text-orange-400 font-bold">{cmd.command}</code>
                    <button
                      onClick={() => copyToClipboard(cmd.example)}
                      className="text-white/40 hover:text-white"
                    >
                      {copiedCommand === cmd.example ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-white/60 text-sm mb-2">{cmd.description}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-white/40">Usage:</span>
                    <code className="text-purple-400">{cmd.usage}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeCategory === 'plugins' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Plugin System</h2>
              <p className="text-white/60 mb-8">
                Extend ASRO with custom plugins. Install from Git repositories or create new ones.
              </p>
            </div>

            {/* Plugin Commands */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Package size={20} className="text-orange-500" />
                Plugin Commands
              </h3>
              <div className="space-y-4">
                {[
                  { cmd: 'asro plugin list', desc: 'List all installed plugins' },
                  { cmd: 'asro plugin install <name> <repo>', desc: 'Install plugin from Git repository' },
                  { cmd: 'asro plugin uninstall <name>', desc: 'Remove installed plugin' },
                  { cmd: 'asro plugin verify <name>', desc: 'Verify plugin via security scan' },
                ].map((item) => (
                  <div key={item.cmd} className="flex gap-4">
                    <code className="text-orange-400 shrink-0">{item.cmd}</code>
                    <span className="text-white/60">- {item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Example Plugin */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Code size={20} className="text-purple-500" />
                Plugin Example
              </h3>
              <pre className="bg-black/50 text-white/80 p-4 rounded-lg overflow-x-auto text-sm">
                {pluginExample}
              </pre>
            </div>

            {/* Multi-tenant */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Layers size={20} className="text-green-500" />
                Multi-Tenant Support
              </h3>
              <p className="text-white/60 mb-4">
                Plugins are isolated by tenant. Set <code className="text-orange-400">TENANT_ID</code> in your config.
              </p>
              <code className="text-sm bg-black/50 text-purple-400 px-2 py-1 rounded">
                asro plugin install my-plugin --tenant my-team
              </code>
            </div>
          </div>
        )}

        {activeCategory === 'ai' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">AI Features</h2>
              <p className="text-white/60 mb-8">
                ASRO uses Google Gemini for AI-powered security scanning and plugin generation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* AI Agents */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Bot size={24} className="text-orange-500" />
                  <h3 className="text-lg font-bold text-white">AI Agents</h3>
                </div>
                <ul className="space-y-2 text-white/60">
                  <li>• <span className="text-orange-400">Gemini-3-Flash</span> - Scanner agent</li>
                  <li>• <span className="text-purple-400">Gemini-Pro</span> - Patch generator</li>
                  <li>• <span className="text-green-400">ASRO-Orchestrator</span> - Coordinator</li>
                </ul>
              </div>

              {/* Plugin Generation */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles size={24} className="text-purple-500" />
                  <h3 className="text-lg font-bold text-white">AI Generation</h3>
                </div>
                <p className="text-white/60 mb-4">
                  Generate new plugins from description:
                </p>
                <code className="text-sm bg-black/50 text-orange-400 px-2 py-1 rounded block">
                  asro generate plugin security audit scanner
                </code>
              </div>
            </div>

            {/* Vulnerability Scanning */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Search size={24} className="text-red-500" />
                <h3 className="text-xl font-bold text-white">Vulnerability Scanning</h3>
              </div>
              <p className="text-white/60 mb-4">
                ASRO scans your codebase using AI to detect:
              </p>
              <ul className="grid md:grid-cols-2 gap-2 text-white/60">
                <li>• SQL Injection vulnerabilities</li>
                <li>• XSS (Cross-Site Scripting)</li>
                <li>• CSRF vulnerabilities</li>
                <li>• Insecure dependencies</li>
                <li>• Hardcoded secrets</li>
                <li>• Insecure configurations</li>
              </ul>
            </div>
          </div>
        )}

        {activeCategory === 'api' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">API Reference</h2>
              <p className="text-white/60 mb-8">
                Backend API endpoints for programmatic access to ASRO.
              </p>
            </div>

            {/* CLI Execute */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Terminal size={20} className="text-orange-500" />
                POST /api/cli/execute
              </h3>
              <p className="text-white/60 mb-4">Execute CLI commands via API</p>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-bold mb-2">Request</h4>
                  <pre className="bg-black/50 text-white/80 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "command": "scan",
  "args": ["src/"],
  "projectId": "12345678",
  "tenantId": "default"
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-2">Response</h4>
                  <pre className="bg-black/50 text-white/80 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "output": "Scanning...",
  "data": { "findings": [] },
  "timestamp": "2026-03-25T06:50:00Z"
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <GitBranch size={20} className="text-purple-500" />
                GET /api/projects
              </h3>
              <p className="text-white/60 mb-4">Fetch user's GitLab projects</p>
              <pre className="bg-black/50 text-white/80 p-4 rounded-lg overflow-x-auto text-sm">
{`// Response
[
  {
    "id": 123,
    "name": "my-project",
    "web_url": "https://gitlab.com/..."
  }
]`}
              </pre>
            </div>

            {/* Health */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap size={20} className="text-green-500" />
                GET /api/health
              </h3>
              <p className="text-white/60 mb-4">Check API server health</p>
              <pre className="bg-black/50 text-white/80 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "status": "ok",
  "timestamp": "2026-03-25T06:50:00Z"
}`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Help;