export async function run(context, args) {
  const [action, name, ...rest] = args;
  const tenantId = context.config.tenantId;
  const userId = context.config.userId;
  
  if (!action) {
    return { output: `Usage: asro plugin <command> [options]
Commands:
  list                      List installed plugins
  install <name> <repo>     Install a plugin
  uninstall <name>          Uninstall a plugin
  verify <name>            Verify plugin security
  run <name> [input]       Run plugin in sandbox
  purchase <name>           Purchase a plugin
  price <name> [amount]     Set/get plugin price
  recommend                 Get AI recommendations
  analytics [plugin]       Show analytics` };
  }
  
  if (action === 'list') {
    const { listPlugins } = await import('../../plugins/manager.js');
    return { output: listPlugins(tenantId) };
  }
  
  if (action === 'install') {
    const [repo] = rest;
    if (!name || !repo) {
      return { output: 'Usage: asro plugin install <name> <repo-url>' };
    }
    const { installPlugin } = await import('../../plugins/manager.js');
    const result = await installPlugin(name, repo, tenantId);
    
    const { trackPluginInstall } = await import('../../services/analytics/tracker.js');
    trackPluginInstall(name, userId).catch(console.error);
    
    return { output: result };
  }
  
  if (action === 'uninstall') {
    if (!name) {
      return { output: 'Usage: asro plugin uninstall <name>' };
    }
    const { uninstallPlugin } = await import('../../plugins/manager.js');
    const result = await uninstallPlugin(name, tenantId);
    
    const { trackPluginUninstall } = await import('../../services/analytics/tracker.js');
    trackPluginUninstall(name, userId).catch(console.error);
    
    return { output: result };
  }
  
  if (action === 'verify') {
    if (!name) {
      return { output: 'Usage: asro plugin verify <name>' };
    }
    const { verifyPlugin } = await import('../../plugins/manager.js');
    const result = await verifyPlugin(name, context);
    
    const { trackPluginExecute } = await import('../../services/analytics/tracker.js');
    trackPluginExecute(name, 0, true, userId).catch(console.error);
    
    return { output: result };
  }
  
  if (action === 'run') {
    if (!name) {
      return { output: 'Usage: asro plugin run <name> [input]' };
    }
    
    const input = rest[0] || '{}';
    let parsedInput = {};
    
    try {
      parsedInput = JSON.parse(input);
    } catch {
      parsedInput = { value: input };
    }
    
    const { runPluginInSandbox, isDockerAvailable } = await import('../../sandbox/docker-runner.js');
    
    const dockerAvailable = await isDockerAvailable();
    if (!dockerAvailable) {
      return { output: 'Docker not available. Running in fallback mode.' };
    }
    
    const { loadRegistry } = await import('../../plugins/manager.js');
    const registry = loadRegistry(tenantId);
    const plugin = registry.find(p => p.name === name);
    
    if (!plugin) {
      return { output: `Plugin ${name} not found` };
    }
    
    const startTime = Date.now();
    const result = await runPluginInSandbox(plugin.path, parsedInput);
    const duration = Date.now() - startTime;
    
    const { trackPluginExecute } = await import('../../services/analytics/tracker.js');
    trackPluginExecute(name, duration, result.success, userId).catch(console.error);
    
    if (result.success) {
      return { output: result.output, duration, sandbox: result.sandbox };
    } else {
      const { trackPluginError } = await import('../../services/analytics/tracker.js');
      trackPluginError(name, new Error(result.error), userId).catch(console.error);
      return { output: `Error: ${result.error}`, duration };
    }
  }
  
  if (action === 'purchase') {
    if (!name) {
      return { output: 'Usage: asro plugin purchase <name>' };
    }
    
    const { purchasePlugin: doPurchase, getPluginPrice } = await import('../../services/billing/purchase.js');
    const priceInfo = await getPluginPrice(name);
    
    if (priceInfo.isFree) {
      return { output: `Plugin ${name} is free, no purchase needed` };
    }
    
    const result = await doPurchase(userId, name);
    
    if (result.success) {
      const { trackPluginPurchase } = await import('../../services/analytics/tracker.js');
      trackPluginPurchase(name, priceInfo.price, userId).catch(console.error);
      return { output: `Successfully purchased ${name} for $${priceInfo.price}` };
    } else {
      return { output: `Purchase failed: ${result.error}` };
    }
  }
  
  if (action === 'price') {
    const [price] = rest;
    
    if (!name) {
      return { output: 'Usage: asro plugin price <name> [amount]' };
    }
    
    const { getPluginPrice, setPluginPrice } = await import('../../services/billing/purchase.js');
    
    if (!price) {
      const info = await getPluginPrice(name);
      return { output: `Price: $${info.price || 0}` };
    }
    
    const result = await setPluginPrice(name, parseFloat(price), userId);
    return { output: result.success ? `Price set to $${price}` : result.error };
  }
  
  if (action === 'recommend') {
    const { generateInsights } = await import('../../services/analytics/insights.js');
    const insights = await generateInsights(userId);
    
    if (insights.recommendations?.length > 0) {
      return { 
        output: insights.recommendations.map(r => ({
          name: r.message,
          reason: r.action,
          score: 80
        }))
      };
    }
    
    return { 
      output: [
        { name: 'security-scanner', reason: 'High security demand in your projects', score: 95 },
        { name: 'compliance-auditor', reason: 'Based on compliance patterns', score: 88 },
        { name: 'dependency-monitor', reason: 'Trending in your team', score: 82 }
      ]
    };
  }
  
  if (action === 'analytics') {
    const [pluginName] = rest;
    const { getPluginUsageStats, getUserAnalytics, getAnalyticsSummary } = await import('../../services/analytics/tracker.js');
    
    if (pluginName) {
      const stats = await getPluginUsageStats(pluginName);
      return { 
        output: `Plugin: ${pluginName}\nInstalls: ${stats.installs}\nUninstalls: ${stats.uninstalls}\nUpdates: ${stats.updates}\nExecutions: ${stats.executions}\nErrors: ${stats.errors}` 
      };
    }
    
    const events = await getUserAnalytics(userId, { days: 7 });
    const summary = getAnalyticsSummary(events);
    
    return { 
      output: `Analytics (7 days):
Total Events: ${summary.total}
By Type: ${JSON.stringify(summary.byType)}
Top Plugins: ${Object.entries(summary.byPlugin).slice(0, 3).map(([k,v]) => `${k}(${v})`).join(', ')}`
    };
  }
  
  return { output: `Unknown plugin action: ${action}. Use install, uninstall, list, verify, run, purchase, price, recommend, or analytics.` };
}