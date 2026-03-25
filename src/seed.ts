import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const seedData = async (projectId?: string) => {
  console.log('Seeding initial ASRO data for project:', projectId || 'global');

  // 1. Agents
  const agents = [
    { name: 'Cleanup Agent', role: 'Repository Maintenance', status: 'idle', purpose: 'Identifies and removes obsolete MRs, stale branches, and failed pipelines.', trigger: 'Daily/Manual', icon: 'Trash2' },
    { name: 'Auto-Rebase Agent', role: 'MR Management', status: 'idle', purpose: 'Automatically rebase MRs behind main branch while respecting MR train dependencies.', trigger: 'Daily/Manual', icon: 'GitPullRequest' },
    { name: 'Release Agent', role: 'Automated Releases', status: 'idle', purpose: 'Runs quality checks, updates documentation, and publishes releases.', trigger: 'Every 2 months', icon: 'Package' },
    { name: 'Rollback Manager', role: 'Safe Action Recovery', status: 'idle', purpose: 'Safe recovery from automated actions with complete audit trail.', trigger: 'Manual', icon: 'RotateCcw' },
    { name: 'Compliance Agent', role: 'Security Compliance', status: 'busy', purpose: 'Autonomous security compliance scanning and validation.', trigger: 'Every MR', icon: 'ShieldCheck' },
    { name: 'Security Patch Agent', role: 'Vulnerability Patching', status: 'idle', purpose: 'Automated vulnerability patching and remediation.', trigger: 'On detection', icon: 'Zap' },
    { name: 'Threat Model Agent', role: 'STRIDE Analysis', status: 'idle', purpose: 'Automated threat assessment using STRIDE methodology.', trigger: 'Every MR', icon: 'ShieldAlert' },
    { name: 'Deployment Optimizer', role: 'Pipeline Optimization', status: 'idle', purpose: 'AI-powered pipeline optimization and performance analysis.', trigger: 'Every MR', icon: 'TrendingUp' },
    { name: 'Green Agent', role: 'Sustainability Tracking', status: 'idle', purpose: 'Sustainability tracking and carbon footprint calculation.', trigger: 'Every pipeline', icon: 'Leaf' },
    { name: 'GCP Security Agent', role: 'Google Cloud Security', status: 'idle', purpose: 'Google Cloud security scanning and compliance validation.', trigger: 'On demand', icon: 'Cloud' },
    { name: 'Final Gate Agent', role: 'Sequential Security Gate', status: 'idle', purpose: 'Evaluate compliance score and critical vulnerabilities before deployment.', trigger: 'After parallel stages', icon: 'Lock' }
  ];

  for (const agent of agents) {
    await addDoc(collection(db, 'agents'), { ...agent, lastAction: 'Initialized', lastActionTime: new Date().toISOString() });
  }

  // 1.1 Pipeline Stages
  const stages = [
    { id: 'compliance', name: 'Compliance Check', description: 'Scan for secrets, verify scripts, audit dependencies.', status: 'success', score: 85, duration: '5s', blocking: true },
    { id: 'patch', name: 'Security Patch', description: 'Scan for vulnerable dependencies and auto-create MRs.', status: 'success', duration: '10s', blocking: false },
    { id: 'threat', name: 'Threat Model', description: 'Run STRIDE analysis and identify critical threats.', status: 'success', duration: '8s', blocking: false },
    { id: 'optimizer', name: 'Deployment Optimizer', description: 'Analyze pipeline duration and parallelization.', status: 'success', duration: '3s', blocking: false },
    { id: 'gate', name: 'Final Gate', description: 'Evaluate compliance score and critical vulnerabilities.', status: 'success', duration: '2s', blocking: true },
    { id: 'deploy', name: 'GitLab Pages Deployment', description: 'Build compliance dashboard and upload artifacts.', status: 'success', duration: '5s', blocking: true }
  ];

  for (const stage of stages) {
    await addDoc(collection(db, 'pipeline_stages'), { ...stage, projectId });
  }

  // 1.2 Sustainability Metrics
  const sustainability = {
    carbonFootprint: 450, // g CO2e
    energyUsage: 120, // Wh
    greenScore: 88,
    optimizationSavings: 15.5,
    projectId
  };
  await addDoc(collection(db, 'sustainability_metrics'), sustainability);

  // 1.3 User Tasks
  const tasks = [
    { title: 'Review Security Patch for auth.ts', priority: 'high', status: 'open', dueDate: new Date(Date.now() + 86400000).toISOString(), projectId },
    { title: 'Approve MR #456: Dependency Update', priority: 'medium', status: 'in-progress', dueDate: new Date(Date.now() + 172800000).toISOString(), projectId },
    { title: 'Run Compliance Audit for Q1', priority: 'critical', status: 'open', dueDate: new Date(Date.now() + 43200000).toISOString(), projectId }
  ];
  for (const task of tasks) {
    await addDoc(collection(db, 'user_tasks'), task);
  }

  // 1.4 User Sessions
  const sessions = [
    { timestamp: new Date(Date.now() - 3600000).toISOString(), duration: '45m', actions: 12, projectId },
    { timestamp: new Date(Date.now() - 86400000).toISOString(), duration: '1h 20m', actions: 24, projectId },
    { timestamp: new Date(Date.now() - 172800000).toISOString(), duration: '30m', actions: 8, projectId }
  ];
  for (const session of sessions) {
    await addDoc(collection(db, 'user_sessions'), session);
  }

  // 2. Vulnerabilities
  const vulns = [
    { title: 'SQL Injection in user search', severity: 'critical', status: 'patching', description: 'Unsanitized input in search query', file: 'src/api/search.ts', line: 42, createdAt: new Date().toISOString(), projectId },
    { title: 'Exposed API Key in config', severity: 'critical', status: 'detected', description: 'Hardcoded GitLab token found', file: 'config/gitlab.json', line: 12, createdAt: new Date().toISOString(), projectId },
    { title: 'Insecure dependency: lodash', severity: 'high', status: 'patched', description: 'Prototype pollution vulnerability', file: 'package.json', line: 24, createdAt: new Date().toISOString(), projectId }
  ];

  for (const vuln of vulns) {
    await addDoc(collection(db, 'vulnerabilities'), vuln);
  }

  // 3. Activity Logs
  const logs = [
    { timestamp: new Date().toISOString(), type: 'SCAN_COMPLETE', message: 'Full repository security scan completed by GPT-4 Scanner.', agentId: 'agent-1', projectId },
    { timestamp: new Date().toISOString(), type: 'PATCH_GENERATED', message: 'Claude Patch Gen generated a fix for SQL Injection in search.ts.', agentId: 'agent-2', projectId },
    { timestamp: new Date().toISOString(), type: 'PIPELINE_TRIGGERED', message: 'Triggered GitLab pipeline #123456 to validate security patch.', projectId }
  ];

  for (const log of logs) {
    await addDoc(collection(db, 'activity_logs'), log);
  }

  // 4. Pipelines
  const pipelines = [
    { status: 'running', ref: 'main', webUrl: 'https://gitlab.com/asro/pipelines/123456', createdAt: new Date().toISOString(), projectId },
    { status: 'failed', ref: 'security-patch-1', webUrl: 'https://gitlab.com/asro/pipelines/123455', createdAt: new Date().toISOString(), projectId },
    { status: 'success', ref: 'main', webUrl: 'https://gitlab.com/asro/pipelines/123454', createdAt: new Date().toISOString(), projectId }
  ];

  for (const p of pipelines) {
    await addDoc(collection(db, 'pipelines'), p);
  }

  console.log('Seeding complete!');
};

// This is a helper to be called from the console or a button for demo purposes
export default seedData;
