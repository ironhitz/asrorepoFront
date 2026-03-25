import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Book, Shield, Terminal, CheckCircle } from 'lucide-react';

const UsageGuide: React.FC = () => {
  const sections = [
    {
      title: 'Pipeline Orchestration Guide',
      icon: Shield,
      content: `
# ASRO Pipeline Orchestration Guide

This guide explains how ASRO orchestrates sequential security gates and how each stage interacts with GitLab CI/CD, the GitLab API, and external services.

---

## Pipeline Architecture Overview

1. **Compliance Check** (Sequential) - Threshold: 80
2. **Security Patch** (Parallel) - Advisory
3. **Threat Model** (Parallel) - Advisory
4. **Deployment Optimizer** (Parallel) - Advisory
5. **Final Gate** (Sequential) - Deterministic Blocking
6. **Deployment to GitLab Pages** (Sequential) - Only if Gate PASSES
`
    },
    {
      title: 'AI Agents Documentation',
      icon: Terminal,
      content: `
# 🤖 ASRO AI Agents Documentation

ASRO includes **11 autonomous AI agents** that work together to automate the entire secure release pipeline:

| Agent | Purpose | Trigger |
|-------|---------|---------|
| **Cleanup Agent** | Repository maintenance | Daily/Manual |
| **Auto-Rebase Agent** | MR rebasing | Daily/Manual |
| **Release Agent** | Automated releases | Every 2 months |
| **Rollback Manager** | Action recovery | Manual |
| **Compliance Agent** | Security compliance | Every MR |
| **Security Patch Agent** | Vulnerability patching | On detection |
| **Threat Model Agent** | STRIDE analysis | Every MR |
| **Deployment Optimizer** | Pipeline optimization | Every MR |
| **Green Agent** | Sustainability tracking | Every pipeline |
| **GCP Security Agent** | Google Cloud security | On demand |
| **Final Gate Agent** | Final validation | After parallel stages |
`
    },
    {
      title: 'Validation Checklist',
      icon: CheckCircle,
      content: `
# ASRO Validation Checklist

### Stage 1: Compliance Check
- [ ] Create test branch with clean code
- [ ] No hardcoded secrets
- [ ] \`package.json\` includes security scripts
- [ ] \`README.md\` and \`SECURITY.md\` exist

### Stage 2: Security Patch
- [ ] Create test branch with vulnerable dependency
- [ ] Verify auto-created MR with title: \`security: Patch vulnerable dependencies\`

### Stage 3: Threat Model
- [ ] Create test branch with code that triggers threat
- [ ] Verify auto-created issue with title: \`[THREAT] {threat_name} - Mitigation Required\`
`
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white tracking-tight">ASRO Usage & Documentation</h2>
        <p className="text-zinc-500 max-w-2xl mx-auto">Complete guide to orchestrating secure pipelines and managing autonomous AI agents.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden">
            <div className="px-8 py-6 border-b border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-950 flex items-center gap-4">
              <div className="w-10 h-10 bg-gitlab-orange/10 rounded-xl flex items-center justify-center">
                <section.icon className="w-5 h-5 text-gitlab-orange" />
              </div>
              <h3 className="text-xl font-bold text-white">{section.title}</h3>
            </div>
            <div className="p-8 prose prose-invert prose-zinc max-w-none">
              <div className="markdown-body">
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsageGuide;
