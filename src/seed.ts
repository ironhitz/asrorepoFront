import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const seedData = async (projectId?: string) => {
  console.log('Seeding initial ASRO data for project:', projectId || 'global');

  // 1. Agents
  const agents = [
    { name: 'GPT-4 Scanner', role: 'Vulnerability Scanner', status: 'idle', lastAction: 'Completed full repo scan', lastActionTime: new Date().toISOString() },
    { name: 'Claude Patch Gen', role: 'Patch Generator', status: 'busy', lastAction: 'Generating patch for CVE-2024-1234', lastActionTime: new Date().toISOString() },
    { name: 'Gemini Validator', role: 'Patch Validator', status: 'idle', lastAction: 'Verified patch for auth.ts', lastActionTime: new Date().toISOString() },
    { name: 'Llama Compliance', role: 'Compliance Auditor', status: 'idle', lastAction: 'Updated SOC2 report', lastActionTime: new Date().toISOString() }
  ];

  for (const agent of agents) {
    await addDoc(collection(db, 'agents'), agent);
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
