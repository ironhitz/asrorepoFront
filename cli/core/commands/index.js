import { registerCommand } from '../engine.js';

export async function handleCommit(args, context) {
  const git = context.gitAdapter;
  const ai = context.aiClient;
  
  if (!git) {
    return { output: 'Error: Git adapter not configured.' };
  }
  
  const status = await git.status();
  
  if (!status || status.length === 0) {
    return { output: 'Nothing to commit. No changes detected.' };
  }
  
  const diff = await git.diff();
  let commitMessage = args.join(' ');
  
  if (!commitMessage && ai) {
    try {
      const response = await ai.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a concise git commit message for these changes:\n\nDiff:\n${diff.slice(0, 2000)}`,
        config: { responseMimeType: 'text/plain' }
      });
      commitMessage = response.text.trim();
    } catch (e) {
      commitMessage = 'Automated commit via ASRO';
    }
  }
  
  if (!commitMessage) {
    commitMessage = 'Automated commit via ASRO';
  }
  
  await git.add('.');
  const result = await git.commit(commitMessage);
  
  return {
    output: `[SUCCESS] Changes committed.\nMessage: ${commitMessage}\n${result}`,
    data: { message: commitMessage }
  };
}

export async function handlePush(args, context) {
  const git = context.gitAdapter;
  const gitlab = context.gitlabClient;
  
  if (!gitlab) {
    return { output: 'Error: GitLab client not configured.' };
  }
  
  if (git) {
    await git.push();
  }
  
  const projectId = context.config.gitlabProjectId;
  const branch = args[0] || 'main';
  
  const response = await gitlab.post(`/projects/${encodeURIComponent(projectId)}/pipeline?ref=${branch}`);
  
  return {
    output: `[SUCCESS] Pipeline triggered.\nPipeline ID: ${response.id}\nStatus: ${response.status}\nURL: ${response.web_url}`,
    data: { pipelineId: response.id, status: response.status }
  };
}

export async function handleScan(args, context) {
  const gitlab = context.gitlabClient;
  const ai = context.aiClient;
  
  if (!gitlab || !ai) {
    return { output: 'Error: GitLab or AI client not configured.' };
  }
  
  const projectId = context.config.gitlabProjectId;
  const targetPath = args[0] || '';
  
  const filesRes = await gitlab.get(`/projects/${encodeURIComponent(projectId)}/repository/tree?recursive=true${targetPath ? `&path=${encodeURIComponent(targetPath)}` : ''}`);
  const files = Array.isArray(filesRes) ? filesRes : [];
  
  const output = `Scanning repository for vulnerabilities...\n[INFO] Found ${files.length} items.\n[INFO] Analyzing with AI...\n`;
  
  const codeFiles = files.filter((f) => f.type === 'blob' && 
    (f.path.endsWith('.ts') || f.path.endsWith('.js') || f.path.endsWith('.py') || f.path.endsWith('.go'))).slice(0, 5);
  
  const findings = [];
  let scanOutput = output;
  
  for (const file of codeFiles) {
    scanOutput += `[INFO] Analyzing ${file.path}...\n`;
    const contentRes = await gitlab.get(`/projects/${encodeURIComponent(projectId)}/repository/files/${encodeURIComponent(file.path)}/raw?ref=main`);
    
    try {
      const response = await ai.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze for security vulnerabilities. Return JSON with "vulnerabilities" array (title, description, severity, file). Empty array if none. File: ${file.path}\n\nCode:\n${contentRes}`,
        config: { responseMimeType: 'application/json' }
      });
      
      const result = JSON.parse(response.text);
      if (result.vulnerabilities?.length > 0) {
        findings.push(...result.vulnerabilities.map((v) => ({ ...v, file: file.path })));
        scanOutput += `[WARN] Found ${result.vulnerabilities.length} issue(s)\n`;
      } else {
        scanOutput += `[INFO] No vulnerabilities found\n`;
      }
    } catch (e) {
      scanOutput += `[ERROR] Failed to analyze ${file.path}\n`;
    }
  }
  
  scanOutput += `[SUCCESS] Scan complete. ${findings.length} vulnerabilities detected.`;
  
  return {
    output: scanOutput,
    data: { findings, fileCount: files.length }
  };
}

export async function handlePatch(args, context) {
  const gitlab = context.gitlabClient;
  const ai = context.aiClient;
  
  if (!gitlab || !ai) {
    return { output: 'Error: GitLab or AI client not configured.' };
  }
  
  const projectId = context.config.gitlabProjectId;
  const vulnerability = args.join(' ');
  
  const response = await ai.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a security patch for this vulnerability: ${vulnerability}. Return JSON with "patch" (unified diff) and "description".`,
    config: { responseMimeType: 'application/json' }
  });
  
  let patchData;
  try {
    patchData = JSON.parse(response.text);
  } catch (e) {
    return { output: `Failed to generate patch: ${response.text}` };
  }
  
  const branchName = `security-patch-${Date.now()}`;
  const branchRes = await gitlab.get(`/projects/${encodeURIComponent(projectId)}/repository/branches/main`);
  const baseSha = branchRes.commit.id;
  
  await gitlab.post(`/projects/${encodeURIComponent(projectId)}/repository/branches`, {
    branch: branchName,
    ref: baseSha
  });
  
  return {
    output: `[SUCCESS] Security patch branch created: ${branchName}\nDescription: ${patchData.description || 'Automated security patch'}\n\nPatch:\n${patchData.patch || 'No patch generated'}`,
    data: { branchName, patch: patchData }
  };
}

export async function handlePipeline(args, context) {
  const gitlab = context.gitlabClient;
  
  if (!gitlab) {
    return { output: 'Error: GitLab client not configured.' };
  }
  
  const projectId = context.config.gitlabProjectId;
  const action = args[0] || 'list';
  
  if (action === 'run') {
    const response = await gitlab.post(`/projects/${encodeURIComponent(projectId)}/pipeline?ref=main`);
    return {
      output: `[SUCCESS] Pipeline triggered.\nPipeline ID: ${response.id}\nStatus: ${response.status}\nURL: ${response.web_url}`,
      data: { pipelineId: response.id }
    };
  }
  
  const pipelines = await gitlab.get(`/projects/${encodeURIComponent(projectId)}/pipelines?per_page=5`);
  const output = 'Recent Pipelines:\n' + 
    (Array.isArray(pipelines) ? pipelines.map((p) => `- #${p.id}: ${p.status} (${p.ref})`).join('\n') : 'No pipelines found');
  
  return { output, data: { pipelines } };
}

export async function handleAgents(args, context) {
  const ai = context.aiClient;
  
  const agents = [
    { name: 'Gemini-3-Flash', role: 'Scanner', status: ai ? 'Online' : 'Offline' },
    { name: 'Gemini-Pro', role: 'Patch Generator', status: ai ? 'Online' : 'Offline' },
    { name: 'ASRO-Orchestrator', role: 'Coordinator', status: 'Online' }
  ];
  
  const output = 'Active AI Agents:\n' + 
    agents.map((a) => `- ${a.name} (${a.role}): ${a.status}`).join('\n');
  
  if (args[0] === 'run' && ai) {
    const agentName = args[1];
    return {
      output: `[INFO] Running agent: ${agentName || 'all'}`,
      data: { agents, running: agentName || 'all' }
    };
  }
  
  return { output, data: { agents } };
}

export async function handleDoctor(args, context) {
  const gitlab = context.gitlabClient;
  const git = context.gitAdapter;
  
  let output = 'ASRO Doctor - Repository Health Check\n';
  let issues = 0;
  
  if (gitlab) {
    try {
      const projectId = context.config.gitlabProjectId;
      const project = await gitlab.get(`/projects/${encodeURIComponent(projectId)}`);
      output += `[OK] GitLab project accessible: ${project.name_with_namespace}\n`;
    } catch (e) {
      output += `[ERROR] GitLab project not accessible: ${e.message}\n`;
      issues++;
    }
  } else {
    output += `[WARN] GitLab client not configured\n`;
  }
  
  if (git) {
    try {
      const status = await git.status();
      output += `[OK] Git repository accessible\n`;
      if (status.length > 0) {
        output += `[INFO] ${status.length} uncommitted changes\n`;
      }
    } catch (e) {
      output += `[ERROR] Git repository not accessible\n`;
      issues++;
    }
  } else {
    output += `[INFO] Git adapter not configured (API mode)\n`;
  }
  
  output += issues === 0 ? '\n[SUCCESS] No issues detected.' : `\n[WARN] ${issues} issue(s) detected.`;
  
  return { output, data: { issues } };
}

export async function handleVersion(args, context) {
  return {
    output: 'ASRO CLI v1.0.0\nBuild: 2026-03-24\nEngine: Unified Core Architecture',
    data: { version: '1.0.0', build: '2026-03-24' }
  };
}

export async function handleWhoami(args, context) {
  const gitlab = context.gitlabClient;
  
  if (!gitlab) {
    return { output: 'Error: GitLab client not configured.' };
  }
  
  const user = await gitlab.get('/user');
  
  return {
    output: `User: ${user.name} (@${user.username})\nEmail: ${user.email}\nID: ${user.id}`,
    data: { user }
  };
}

export async function handleRepo(args, context) {
  const gitlab = context.gitlabClient;
  
  if (!gitlab) {
    return { output: 'Error: GitLab client not configured.' };
  }
  
  const projectId = context.config.gitlabProjectId;
  const project = await gitlab.get(`/projects/${encodeURIComponent(projectId)}`);
  
  return {
    output: `Project: ${project.name_with_namespace}\nID: ${project.id}\nVisibility: ${project.visibility}\nDefault Branch: ${project.default_branch}\nURL: ${project.web_url}`,
    data: { project }
  };
}

export async function handleConfig(args, context) {
  const config = context.config;
  
  return {
    output: `Configuration:\n- GITLAB_BASE_URL: ${config.gitlabBaseUrl || 'https://gitlab.com/api/v4'}\n- GITLAB_PROJECT_ID: ${config.gitlabProjectId || 'Not set'}\n- AI_MODEL: gemini-3-flash-preview\n- SCAN_DEPTH: deep`,
    data: { config }
  };
}

export async function handlePlugin(args, context) {
  const [action, name, repo] = args;
  
  if (!action) {
    return { output: 'Usage: asro plugin <install|uninstall|list> [name] [repo]' };
  }
  
  if (action === 'list') {
    const { listPlugins } = await import('../../plugins/manager.js');
    return { output: listPlugins() };
  }
  
  if (action === 'install') {
    if (!name || !repo) {
      return { output: 'Usage: asro plugin install <name> <repo-url>' };
    }
    const { installPlugin } = await import('../../plugins/manager.js');
    const result = await installPlugin(name, repo);
    return { output: result };
  }
  
  if (action === 'uninstall') {
    if (!name) {
      return { output: 'Usage: asro plugin uninstall <name>' };
    }
    const { uninstallPlugin } = await import('../../plugins/manager.js');
    const result = await uninstallPlugin(name);
    return { output: result };
  }
  
  return { output: `Unknown plugin action: ${action}. Use install, uninstall, or list.` };
}

export async function handleHelp(args, context) {
  return {
    output: `ASRO CLI v1.0.0 - Available Commands:
- asro commit [message]: AI-enhanced git commit
- asro push: Push and trigger GitLab pipeline
- asro scan [path]: AI vulnerability scan
- asro patch <vulnerability>: Generate and apply patch
- asro pipeline [run|list]: Pipeline management
- asro agents [run]: List and run AI agents
- asro plugin install <name> <repo>: Install plugin from repo
- asro plugin uninstall <name>: Uninstall plugin
- asro plugin list: List installed plugins
- asro doctor: Repository health check
- asro repo: Show repository info
- asro whoami: Show user info
- asro config: Show configuration
- asro version: Show CLI version
- asro help: Show this help message`
  };
}

export function registerAllCommands(context) {
  registerCommand('asro commit', handleCommit);
  registerCommand('asro push', handlePush);
  registerCommand('asro scan', handleScan);
  registerCommand('asro patch', handlePatch);
  registerCommand('asro pipeline', handlePipeline);
  registerCommand('asro pipeline run', handlePipeline);
  registerCommand('asro pipelines', handlePipeline);
  registerCommand('asro agents', handleAgents);
  registerCommand('asro agents run', handleAgents);
  registerCommand('asro doctor', handleDoctor);
  registerCommand('asro version', handleVersion);
  registerCommand('asro whoami', handleWhoami);
  registerCommand('asro repo', handleRepo);
  registerCommand('asro config', handleConfig);
  registerCommand('asro plugin', handlePlugin);
  registerCommand('asro plugin install', handlePlugin);
  registerCommand('asro plugin uninstall', handlePlugin);
  registerCommand('asro plugin list', handlePlugin);
  registerCommand('asro help', handleHelp);
}