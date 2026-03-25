import React, { useState } from 'react';
import { CheckCircle2, Shield, Zap, GitPullRequest, Lock, Eye, Terminal, Settings, Database, Globe, Activity, Clock, GitBranch, ShieldCheck, FileText, ShieldAlert, Package, ExternalLink, Code2, Copy } from 'lucide-react';
import { motion } from 'motion/react';

const GitLabImprovements: React.FC = () => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const improvements = [
    {
      title: "Secret Management",
      description: "Never store secrets in your repository. Use GitLab CI/CD variables or external secret managers like HashiCorp Vault.",
      icon: Lock,
      category: "Security",
      links: [
        { name: 'GitLab Secrets Docs', url: 'https://docs.gitlab.com/ee/ci/secrets/' },
        { name: 'Vault Integration', url: 'https://docs.gitlab.com/ee/ci/secrets/hashicorp_vault.html' }
      ],
      code: `
# .gitlab-ci.yml example for secrets
job:
  script:
    - echo "Using secret: $MY_SECRET_VARIABLE"
  variables:
    MY_SECRET_VARIABLE: ${'${MY_SECRET_VARIABLE}'} # Masked in GitLab
`
    },
    {
      title: "Dependency Scanning",
      description: "Enable GitLab Dependency Scanning to automatically detect vulnerabilities in your project dependencies.",
      icon: Shield,
      category: "Security",
      links: [
        { name: 'Dependency Scanning Docs', url: 'https://docs.gitlab.com/ee/user/application_security/dependency_scanning/' },
        { name: 'Vulnerability Database', url: 'https://advisories.gitlab.com/' }
      ],
      code: `
include:
  - template: Security/Dependency-Scanning.gitlab-ci.yml

dependency_scanning:
  stage: test
`
    },
    {
      title: "Branch Protection",
      description: "Protect your main branch to prevent direct pushes and require merge request approvals.",
      icon: GitBranch,
      category: "Governance",
      links: [
        { name: 'Protected Branches', url: 'https://docs.gitlab.com/ee/user/project/protected_branches.html' },
        { name: 'Approvals', url: 'https://docs.gitlab.com/ee/user/project/merge_requests/approvals/' }
      ],
      code: `
# API call to protect a branch
curl --request POST --header "PRIVATE-TOKEN: <your_access_token>" \\
     "https://gitlab.example.com/api/v4/projects/1/protected_branches?name=main&push_access_level=0&merge_access_level=40"
`
    },
    {
      title: "SAST Analysis",
      description: "Static Application Security Testing (SAST) analyzes your source code for known vulnerabilities.",
      icon: Eye,
      category: "Security",
      links: [
        { name: 'SAST Docs', url: 'https://docs.gitlab.com/ee/user/application_security/sast/' }
      ],
      code: `
include:
  - template: Security/SAST.gitlab-ci.yml

sast:
  stage: test
`
    },
    {
      title: "Container Scanning",
      description: "Scan your Docker images for vulnerabilities in the OS packages and dependencies.",
      icon: Package,
      category: "Security",
      links: [
        { name: 'Container Scanning Docs', url: 'https://docs.gitlab.com/ee/user/application_security/container_scanning/' }
      ],
      code: `
include:
  - template: Security/Container-Scanning.gitlab-ci.yml

container_scanning:
  stage: test
  variables:
    DOCKER_IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
`
    },
    {
      title: "Infrastructure as Code (IaC) Scanning",
      description: "Scan your Terraform, Ansible, and Kubernetes files for security misconfigurations.",
      icon: Database,
      category: "Security",
      links: [
        { name: 'IaC Scanning Docs', url: 'https://docs.gitlab.com/ee/user/application_security/iac_scanning/' }
      ],
      code: `
include:
  - template: Security/IaC-Scanning.gitlab-ci.yml

iac-scanning:
  stage: test
`
    }
  ];

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {improvements.map((item, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className="bg-zinc-900/50 border border-white/10 rounded-3xl hover:border-gitlab-orange/50 transition-all group shadow-xl overflow-hidden flex flex-col"
          >
            <div className="p-8 space-y-6 flex-grow">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-zinc-950 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-gitlab-orange/20 transition-all shadow-inner">
                  <item.icon className="w-6 h-6 text-gitlab-orange" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                  {item.category}
                </span>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white tracking-tight group-hover:text-gitlab-orange transition-colors">{item.title}</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.description}</p>
              </div>

              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Resources</h5>
                <div className="flex flex-wrap gap-2">
                  {item.links.map((link, lIdx) => (
                    <a 
                      key={lIdx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center gap-2 text-[10px] font-medium text-zinc-300 transition-all"
                    >
                      {link.name}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-black/40 border-t border-white/5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <Code2 className="w-3 h-3" />
                  Implementation Sample
                </div>
                <button 
                  onClick={() => copyToClipboard(item.code.trim(), idx)}
                  className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all flex items-center gap-2"
                >
                  {copiedIdx === idx ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span className="text-[10px] uppercase tracking-widest">{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="bg-black/60 rounded-xl p-4 border border-white/5 font-mono text-[11px] text-zinc-400 overflow-x-auto">
                <pre>{item.code.trim()}</pre>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GitLabImprovements;
