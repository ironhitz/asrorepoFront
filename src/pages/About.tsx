import React from 'react';
import { motion } from 'motion/react';
import { Heart, Github, ExternalLink, Shield, Code, Users, Terminal, Package, Sparkles, Lock, Unlock, AlertTriangle } from 'lucide-react';

export function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="space-y-12 py-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Section */}
      <motion.section variants={itemVariants} className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          About ASRO
        </h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto">
          Enterprise-grade security dashboard powered by AI-driven vulnerability scanning and compliance management
        </p>
      </motion.section>

      {/* Mission Section */}
      <motion.section variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white">Our Mission</h2>
        <p className="text-white/70 leading-relaxed">
          ASRO (AI Security Orchestration) was built to democratize enterprise security. We believe every organization,
          regardless of size, deserves access to world-class security orchestration powered by artificial intelligence.
          Our mission is to make security accessible, transparent, and automated.
        </p>
      </motion.section>

      {/* Features Section */}
      <motion.section variants={itemVariants} className="space-y-4">
        <h2 className="text-2xl font-bold text-white">What We Offer</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: 'Real-Time Security',
              desc: 'Live security scores and vulnerability tracking with instant threat detection',
            },
            {
              icon: Code,
              title: 'Compliance Management',
              desc: 'Multi-framework tracking (SOC2, GDPR, OWASP, PCI-DSS, HIPAA, ISO 27001)',
            },
            {
              icon: Users,
              title: 'Team Collaboration',
              desc: 'Built for teams to work together on security improvements and remediation',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-3 hover:bg-white/10 transition-all"
            >
              <feature.icon className="text-orange-500" size={32} />
              <h3 className="font-bold text-white">{feature.title}</h3>
              <p className="text-white/60 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Technology Stack */}
      <motion.section variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white">Built With</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-bold text-purple-400">Frontend</h3>
            <ul className="text-white/60 space-y-1">
              <li>• React 19 + TypeScript</li>
              <li>• Vite 6 (Build tool)</li>
              <li>• Tailwind CSS 4.1</li>
              <li>• Motion Library (animations)</li>
              <li>• Lucide React (icons)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-purple-400">Backend & Data</h3>
            <ul className="text-white/60 space-y-1">
              <li>• Firebase Firestore</li>
              <li>• GitLab API Integration</li>
              <li>• Node.js (server)</li>
              <li>• Real-time data sync</li>
              <li>• Secure authentication</li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* Security Model Section - Demo vs Production */}
      <motion.section variants={itemVariants} className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Shield className="text-yellow-500" size={28} />
          Security Model
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Demo Mode */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <Unlock className="text-yellow-400" size={20} />
              <h3 className="font-bold text-yellow-400">Demo Mode (Current)</h3>
            </div>
            <ul className="text-white/70 space-y-2 text-sm">
              <li>• 🔓 Plugins run with full access</li>
              <li>• 🔓 Network access enabled</li>
              <li>• 🔓 Filesystem read/write allowed</li>
              <li>• 🔓 API keys accessible</li>
              <li>• 🎯 For demonstration & testing</li>
            </ul>
            <div className="mt-4 p-3 bg-yellow-500/5 rounded text-xs text-yellow-400/70">
              ⚠️ Used for: Demos, judge walkthroughs, feature exploration
            </div>
          </div>

          {/* Production Mode */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="text-emerald-400" size={20} />
              <h3 className="font-bold text-emerald-400">Production Mode (Future)</h3>
            </div>
            <ul className="text-white/70 space-y-2 text-sm">
              <li>→ Zero-trust sandbox (WASM)</li>
              <li>• 🔐 Network disabled by default</li>
              <li>• 🔐 Read-only filesystem</li>
              <li>• 🔐 Secrets encrypted</li>
              <li>• 🔐 Docker container isolation</li>
            </ul>
            <div className="mt-4 p-3 bg-emerald-500/5 rounded text-xs text-emerald-400/70">
              🔒 Used for: Production deployments, secure environments
            </div>
          </div>
        </div>

        {/* Attack Simulation Info */}
        <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400" size={24} />
            <div>
              <h4 className="font-bold text-red-400">Attack Simulation Demo</h4>
              <p className="text-white/60 text-sm mt-1">
                The platform includes attack simulation capabilities to demonstrate security vulnerabilities. 
                In demo mode, attacks succeed (to show the problem). In production, zero-trust sandbox blocks them.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CLI System */}
      <motion.section variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Terminal className="text-orange-500" size={28} />
          Unified CLI System
        </h2>
        <p className="text-white/70 leading-relaxed">
          ASRO comes with a powerful command-line interface that works identically in local development 
          environments and browser-based terminals. Execute security scans, manage plugins, and control 
          GitLab pipelines seamlessly.
        </p>
        
        <div className="grid md:grid-cols-3 gap-4 pt-4">
          <div className="bg-black/30 rounded-lg p-4 border border-orange-500/20">
            <Terminal className="text-orange-500 mb-2" size={24} />
            <h3 className="font-bold text-white mb-1">Commands</h3>
            <p className="text-white/60 text-sm">
              scan, commit, push, patch, pipeline, doctor, and more
            </p>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
            <Package className="text-purple-500 mb-2" size={24} />
            <h3 className="font-bold text-white mb-1">Plugin System</h3>
            <p className="text-white/60 text-sm">
              Extend functionality with AI-generated plugins
            </p>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 border border-green-500/20">
            <Sparkles className="text-green-500 mb-2" size={24} />
            <h3 className="font-bold text-white mb-1">AI-Powered</h3>
            <p className="text-white/60 text-sm">
              Google Gemini integration for intelligent automation
            </p>
          </div>
        </div>

        <div className="pt-4">
          <code className="text-sm bg-black/50 text-orange-400 px-3 py-2 rounded block inline-block">
            npm run cli -- help
          </code>
        </div>
      </motion.section>

      {/* Support Development Section */}
      <motion.section variants={itemVariants} className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/30 rounded-xl p-8 space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">Support Development</h2>
          <p className="text-white/70">
            ASRO is built with ❤️ by passionate developers. Help us continue building amazing security tools!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="https://paypal.me/Ironhitz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 rounded-lg font-bold text-lg transition-all hover:shadow-lg transform hover:scale-105"
          >
            <Heart size={24} className="fill-current" />
            Donate via PayPal
            <ExternalLink size={20} />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 rounded-lg font-bold border border-white/20 transition-all"
          >
            <Github size={24} />
            Star on GitHub
          </a>
        </div>

        <div className="mt-8 space-y-3 text-sm">
          <p className="font-semibold text-white">Your donation helps us:</p>
          <div className="grid sm:grid-cols-2 gap-3 text-white/70">
            <div>🚀 Add new features faster</div>
            <div>🔒 Improve security & performance</div>
            <div>📚 Create better documentation</div>
            <div>🐛 Fix bugs quickly</div>
            <div>💰 Sustain long-term development</div>
            <div>🎯 Build community tools</div>
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white">Built By</h2>
        <p className="text-white/70">
          ASRO is developed as part of the AI Hackathon initiative, bringing together security engineers, ML experts,
          and full-stack developers passionate about making enterprise security accessible to everyone.
        </p>
        <div className="flex gap-4 pt-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Github size={18} />
            GitHub
          </a>
          <a
            href="https://gitlab.com/git-lab-AI-hackathon/asrorepo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ExternalLink size={18} />
            GitLab Repo
          </a>
        </div>
      </motion.section>

      {/* Open Source Section */}
      <motion.section variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white">Open Source</h2>
        <p className="text-white/70">
          ASRO is open source software released under the MIT License. We believe in transparency, community
          contribution, and sharing security best practices. Check out our code on GitHub and GitLab!
        </p>
        <div className="pt-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-orange-500 hover:text-orange-400 font-semibold"
          >
            View Source Code →
          </a>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section variants={itemVariants} className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-bold text-white">Ready to Secure Your Projects?</h2>
        <p className="text-white/70 max-w-xl mx-auto">
          ASRO integrates seamlessly with your GitLab repositories. Start scanning for vulnerabilities and tracking
          compliance in minutes.
        </p>
        <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 rounded-lg font-bold transition-all hover:shadow-lg">
          Get Started →
        </button>
      </motion.section>

      {/* FAQ Section */}
      <motion.section variants={itemVariants} className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            {
              q: 'Is ASRO free?',
              a: 'Yes! ASRO is completely free and open source. We rely on community support and donations to continue development.',
            },
            {
              q: 'Can I use ASRO in production?',
              a: 'Absolutely! ASRO is production-ready with enterprise-grade security, error handling, and compliance tracking.',
            },
            {
              q: 'What data does ASRO collect?',
              a: 'ASRO only connects to your GitLab repository via API token. No data is stored on our servers. Everything stays in your control.',
            },
            {
              q: 'How do I contribute?',
              a: 'Check out our GitHub repo and CONTRIBUTING.md guide. We welcome pull requests, bug reports, and feature suggestions!',
            },
          ].map((item, i) => (
            <motion.div key={i} variants={itemVariants} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 className="font-bold text-white mb-2">{item.q}</h3>
              <p className="text-white/60 text-sm">{item.a}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
