import fs from 'fs';
import path from 'path';
import { loadRegistry } from '../plugins/manager.js';

const pluginCache = new Map();

export async function loadPlugins(tenantId = 'default') {
  const registry = loadRegistry(tenantId);
  const plugins = {};
  
  for (const plugin of registry) {
    const cacheKey = `${tenantId}:${plugin.name}`;
    if (pluginCache.has(cacheKey)) {
      Object.assign(plugins, pluginCache.get(cacheKey));
      continue;
    }
    
    try {
      const pluginPath = path.join(plugin.path, 'index.js');
      if (fs.existsSync(pluginPath)) {
        const mod = await import(`file://${pluginPath}`);
        if (mod.default?.commands) {
          Object.assign(plugins, mod.default.commands);
          pluginCache.set(cacheKey, mod.default.commands);
        }
      }
    } catch (error) {
      console.warn(`Failed to load plugin ${plugin.name}:`, error);
    }
  }
  
  return plugins;
}

export function clearPluginCache() {
  pluginCache.clear();
}