import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

const seedData = async (projectId?: string, user?: User | null) => {
  console.log('Seeding initial ASRO data for project:', projectId || 'global');
  
  const userId = user?.id;

  // 1. Agents
  const agents = [
    { name: 'GPT-4 Scanner', role: 'Vulnerability Scanner', status: 'idle', lastAction: 'Completed full repo scan', userId },
    { name: 'Claude Patch Gen', role: 'Patch Generator', status: 'busy', lastAction: 'Generating patch for CVE-2024-1234', userId },
    { name: 'Gemini Validator', role: 'Patch Validator', status: 'idle', lastAction: 'Verified patch for auth.ts', userId },
    { name: 'Llama Compliance', role: 'Compliance Auditor', status: 'idle', lastAction: 'Updated SOC2 report', userId }
  ];

  for (const agent of agents) {
    await supabase.from('agents').insert(agent);
  }

  // 2. Vulnerabilities
  const vulns = [
    { title: 'SQL Injection in user search', severity: 'critical', status: 'patching', description: 'Unsanitized input in search query', file: 'src/api/search.ts', projectId, userId, history: [] },
    { title: 'Exposed API Key in config', severity: 'critical', status: 'detected', description: 'Hardcoded GitLab token found', file: 'config/gitlab.json', projectId, userId, history: [] },
    { title: 'Insecure dependency: lodash', severity: 'high', status: 'patched', description: 'Prototype pollution vulnerability', file: 'package.json', projectId, userId, history: [] }
  ];

  for (const vuln of vulns) {
    await supabase.from('vulnerabilities').insert(vuln);
  }

  // 3. Activity Logs
  const logs = [
    { timestamp: new Date().toISOString(), type: 'SCAN_COMPLETE', message: 'Full repository security scan completed by GPT-4 Scanner.', agentId: 'agent-1', projectId, userId },
    { timestamp: new Date().toISOString(), type: 'PATCH_GENERATED', message: 'Claude Patch Gen generated a fix for SQL Injection in search.ts.', agentId: 'agent-2', projectId, userId },
    { timestamp: new Date().toISOString(), type: 'PIPELINE_TRIGGERED', message: 'Triggered GitLab pipeline #123456 to validate security patch.', projectId, userId }
  ];

  for (const log of logs) {
    await supabase.from('activity_logs').insert(log);
  }

  // 4. Pipelines
  const pipelines = [
    { status: 'running', ref: 'main', webUrl: 'https://gitlab.com/asro/pipelines/123456', projectId, userId },
    { status: 'failed', ref: 'security-patch-1', webUrl: 'https://gitlab.com/asro/pipelines/123455', projectId, userId },
    { status: 'success', ref: 'main', webUrl: 'https://gitlab.com/asro/pipelines/123454', projectId, userId }
  ];

  for (const p of pipelines) {
    await supabase.from('pipelines').insert(p);
  }

  console.log('Seeding complete!');
};

export default seedData;
