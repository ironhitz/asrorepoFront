import { createContext, emitEvent, EventEmitter } from './context.js';

let pluginCommands = {};

export async function loadPluginCommands() {
  try {
    const { loadPlugins } = await import('./plugin-loader.js');
    pluginCommands = await loadPlugins();
  } catch (e) {
    console.warn('No plugins loaded:', e.message);
  }
}

loadPluginCommands();

export async function executeCommand(command, args = [], context = null) {
  const ctx = context || createContext();
  
  emitEvent(ctx, EventEmitter.COMMAND_STARTED, { command, args });
  
  const baseCommands = {
    commit: async () => {
      const { run } = await import('./commands/commit.js');
      return await run(ctx, args);
    },
    push: async () => {
      const { run } = await import('./commands/push.js');
      return await run(ctx, args);
    },
    scan: async () => {
      const { run } = await import('./commands/scan.js');
      return await run(ctx, args);
    },
    patch: async () => {
      const { run } = await import('./commands/patch.js');
      return await run(ctx, args);
    },
    pipeline: async () => {
      const { run } = await import('./commands/pipeline.js');
      return await run(ctx, args);
    },
    plugin: async () => {
      const { run } = await import('./commands/plugin.js');
      return await run(ctx, args);
    },
    generate: async () => {
      const { run } = await import('./commands/generate-plugin.js');
      return await run(ctx, args);
    },
    agents: async () => {
      const { run } = await import('./commands/agents.js');
      return await run(ctx, args);
    },
    doctor: async () => {
      const { run } = await import('./commands/doctor.js');
      return await run(ctx, args);
    },
    version: async () => {
      const { run } = await import('./commands/version.js');
      return await run(ctx, args);
    },
    whoami: async () => {
      const { run } = await import('./commands/whoami.js');
      return await run(ctx, args);
    },
    repo: async () => {
      const { run } = await import('./commands/repo.js');
      return await run(ctx, args);
    },
    config: async () => {
      const { run } = await import('./commands/config.js');
      return await run(ctx, args);
    },
    help: async () => {
      const { run } = await import('./commands/help.js');
      return await run(ctx, args);
    }
  };

  const plugins = await loadPluginCommands();
  const commands = { ...baseCommands, ...plugins };

  if (!commands[command]) {
    const result = {
      success: false,
      output: `Unknown command: ${command}. Type 'asro help' for available commands.`
    };
    emitEvent(ctx, EventEmitter.COMMAND_FAILED, { command, error: 'Command not found' });
    return result;
  }

  try {
    const result = await commands[command]();
    emitEvent(ctx, EventEmitter.COMMAND_COMPLETED, { command, success: true });
    return {
      success: true,
      output: result.output,
      data: result.data
    };
  } catch (error) {
    const result = {
      success: false,
      output: `Error: ${error instanceof Error ? error.message : String(error)}`
    };
    emitEvent(ctx, EventEmitter.COMMAND_FAILED, { command, error: error.message });
    return result;
  }
}

export async function executeCommandString(commandString, context = null) {
  const parts = commandString.trim().split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);
  return executeCommand(command, args, context);
}

export function initializeEngine(context) {
  return {
    executeCommand: (cmd, args) => executeCommand(cmd, args, context),
  };
}

export { createContext, EventEmitter };