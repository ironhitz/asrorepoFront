export async function run(context, args) {
  const [action, name, repo] = args;
  const tenantId = context.config.tenantId;
  
  if (!action) {
    return { output: 'Usage: asro plugin <install|uninstall|list|verify> [name] [repo]' };
  }
  
  if (action === 'list') {
    const { listPlugins } = await import('../../plugins/manager.js');
    return { output: listPlugins(tenantId) };
  }
  
  if (action === 'install') {
    if (!name || !repo) {
      return { output: 'Usage: asro plugin install <name> <repo-url>' };
    }
    const { installPlugin } = await import('../../plugins/manager.js');
    const result = await installPlugin(name, repo, tenantId);
    return { output: result };
  }
  
  if (action === 'uninstall') {
    if (!name) {
      return { output: 'Usage: asro plugin uninstall <name>' };
    }
    const { uninstallPlugin } = await import('../../plugins/manager.js');
    const result = await uninstallPlugin(name, tenantId);
    return { output: result };
  }
  
  if (action === 'verify') {
    if (!name) {
      return { output: 'Usage: asro plugin verify <name>' };
    }
    const { verifyPlugin } = await import('../../plugins/manager.js');
    const result = await verifyPlugin(name, context);
    return { output: result };
  }
  
  return { output: `Unknown plugin action: ${action}. Use install, uninstall, list, or verify.` };
}