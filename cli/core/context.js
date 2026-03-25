export class Context {
  constructor(options = {}) {
    this.gitAdapter = options.gitAdapter || null;
    this.gitlabClient = options.gitlabClient || null;
    this.aiClient = options.aiClient || null;
    this.logger = options.logger || defaultLogger;
    this.config = {
      tenantId: 'default',
      gitlabBaseUrl: 'https://gitlab.com/api/v4',
      gitlabProjectId: null,
      ...options.config
    };
  }

  log(level, message, data = {}) {
    const eventData = { 
      tenantId: this.config.tenantId,
      ...data, 
      timestamp: new Date().toISOString() 
    };
    this.logger(level, message, eventData);
  }
}

function defaultLogger(level, message, data) {
  const prefix = `[${level.toUpperCase()}]`;
  console.log(prefix, message, JSON.stringify(data));
}

export const EventEmitter = {
  COMMAND_STARTED: 'COMMAND_STARTED',
  COMMAND_COMPLETED: 'COMMAND_COMPLETED',
  COMMAND_FAILED: 'COMMAND_FAILED'
};

export function createContext(options = {}) {
  return new Context(options);
}

export function emitEvent(context, event, data = {}) {
  const eventData = { 
    event, 
    tenantId: context.config?.tenantId,
    ...data, 
    timestamp: new Date().toISOString() 
  };
  context.log(event, '', eventData);
  return eventData;
}