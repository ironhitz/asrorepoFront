import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function getPluginDir(tenantId = 'default') {
  return path.resolve(process.cwd(), '.asro', 'tenants', tenantId, 'plugins');
}

function getRegistryPath(tenantId = 'default') {
  return path.join(getPluginDir(tenantId), 'registry.json');
}

export function loadRegistry(tenantId = 'default') {
  const registryPath = getRegistryPath(tenantId);
  if (!fs.existsSync(registryPath)) return [];
  return JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
}

export function saveRegistry(data, tenantId = 'default') {
  const pluginDir = getPluginDir(tenantId);
  fs.mkdirSync(pluginDir, { recursive: true });
  fs.writeFileSync(getRegistryPath(tenantId), JSON.stringify(data, null, 2));
}

export async function installPlugin(name, repoUrl, tenantId = 'default') {
  const pluginPath = path.join(getPluginDir(tenantId), name);
  
  if (fs.existsSync(pluginPath)) {
    return `Plugin ${name} already installed`;
  }

  try {
    fs.mkdirSync(pluginPath, { recursive: true });
    execSync(`git clone ${repoUrl} ${pluginPath}`, { stdio: 'pipe' });
    
    const registry = loadRegistry(tenantId);
    registry.push({ 
      name, 
      path: pluginPath, 
      repoUrl, 
      tenantId,
      installedAt: new Date().toISOString(),
      verified: false 
    });
    saveRegistry(registry, tenantId);
    
    return `Plugin ${name} installed successfully`;
  } catch (error) {
    return `Failed to install plugin: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export async function uninstallPlugin(name, tenantId = 'default') {
  const pluginPath = path.join(getPluginDir(tenantId), name);
  
  if (!fs.existsSync(pluginPath)) {
    return `Plugin ${name} not found`;
  }
  
  try {
    fs.rmSync(pluginPath, { recursive: true, force: true });
    
    const registry = loadRegistry(tenantId).filter((p) => p.name !== name);
    saveRegistry(registry, tenantId);
    
    return `Plugin ${name} uninstalled successfully`;
  } catch (error) {
    return `Failed to uninstall plugin: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export function listPlugins(tenantId = 'default') {
  const registry = loadRegistry(tenantId);
  if (registry.length === 0) return 'No plugins installed';
  
  return 'Installed plugins:\n' + registry.map((p) => 
    `- ${p.name} (verified: ${p.verified ? '✓' : '✗'}, installed: ${new Date(p.installedAt).toLocaleDateString()})`
  ).join('\n');
}

export async function verifyPlugin(name, context) {
  const tenantId = context.config?.tenantId || 'default';
  const registry = loadRegistry(tenantId);
  const plugin = registry.find(p => p.name === name);
  
  if (!plugin) {
    return `Plugin ${name} not found`;
  }
  
  const gitlab = context.gitlabClient;
  if (!gitlab) {
    return 'GitLab client not configured';
  }
  
  try {
    const projectId = context.config.gitlabProjectId;
    
    const scanResponse = await gitlab.get(`/projects/${encodeURIComponent(projectId)}/vulnerabilities`);
    const vulnerabilities = Array.isArray(scanResponse) ? scanResponse : [];
    
    plugin.verified = vulnerabilities.length === 0;
    plugin.lastVerified = new Date().toISOString();
    
    saveRegistry(registry, tenantId);
    
    return `Plugin "${name}" verification ${plugin.verified ? 'PASSED' : 'FAILED'}\nVulnerabilities found: ${vulnerabilities.length}`;
  } catch (error) {
    return `Verification failed: ${error.message}`;
  }
}

export async function improvePlugin(pluginCode, logs, context) {
  const ai = context.aiClient;
  
  if (!ai) {
    return { success: false, output: 'AI client not configured' };
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Improve this plugin code based on execution logs:\n\nLogs:\n${logs}\n\nCurrent Code:\n${pluginCode}\n\nReturn improved code.`,
      config: { responseMimeType: 'text/plain' }
    });
    
    return { success: true, output: response.text };
  } catch (error) {
    return { success: false, output: error.message };
  }
}