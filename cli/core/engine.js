import { createContext, emitEvent, EventEmitter } from './context.js';
import { registerAllCommands } from './commands/index.js';

const commandRegistry = new Map();

export function registerCommand(name, handler) {
  commandRegistry.set(name, handler);
}

export function getCommand(name) {
  return commandRegistry.get(name);
}

export async function executeCommand(command, args = [], context = null) {
  const ctx = context || createContext();
  
  emitEvent(ctx, EventEmitter.COMMAND_STARTED, { command, args });
  
  const [cmdName, ...cmdArgs] = args;
  const fullCommand = `${command} ${cmdName || ''}`.trim();
  
  const handler = getCommand(fullCommand) || getCommand(command);
  
  if (!handler) {
    const result = {
      success: false,
      output: `Command not found: ${command}. Type 'asro help' for available commands.`
    };
    emitEvent(ctx, EventEmitter.COMMAND_FAILED, { command, error: 'Command not found' });
    return result;
  }
  
  try {
    const result = await handler(cmdArgs, ctx);
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

export function initializeEngine(context) {
  registerAllCommands(context);
  return {
    executeCommand: (cmd, args) => executeCommand(cmd, args, context),
    registerCommand,
    getCommand
  };
}

export async function executeCommandString(commandString, context = null) {
  const parts = commandString.trim().split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);
  return executeCommand(command, args, context);
}

export { createContext, EventEmitter };