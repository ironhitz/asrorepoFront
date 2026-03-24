import { createContext, initializeEngine, executeCommandString } from '../core/engine.js';
import { createNodeGitAdapter } from './git-adapter.js';

const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
const GITLAB_BASE_URL = process.env.GITLAB_BASE_URL || 'https://gitlab.com/api/v4';
const GITLAB_PROJECT_ID = process.env.GITLAB_PROJECT_ID;

class SimpleLogger {
  log(level, message, data) {
    const prefix = `[${level.toUpperCase()}]`;
    console.log(prefix, message, JSON.stringify(data, null, 0));
  }
}

let aiClient = null;

try {
  const { GoogleGenAI } = await import('@google/genai');
  if (process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (e) {
  console.warn('AI client not available:', e.message);
}

let gitlabClient = null;

if (GITLAB_TOKEN) {
  const { GitLabApiAdapter } = await import('./gitlab-adapter.js');
  gitlabClient = new GitLabApiAdapter(GITLAB_TOKEN, GITLAB_BASE_URL);
}

const gitAdapter = createNodeGitAdapter(process.cwd());

const context = createContext({
  gitAdapter,
  gitlabClient,
  aiClient,
  logger: new SimpleLogger(),
  config: {
    gitlabBaseUrl: GITLAB_BASE_URL,
    gitlabProjectId: GITLAB_PROJECT_ID,
    gitlabToken: GITLAB_TOKEN ? `${GITLAB_TOKEN.substring(0, 8)}...` : null
  }
});

initializeEngine(context);

const args = process.argv.slice(2);
const commandString = args.join(' ') || 'asro help';

if (commandString === 'help' || commandString === '--help' || commandString === '-h') {
  executeCommandString('asro help', context).then(result => {
    console.log(result.output);
    process.exit(result.success ? 0 : 1);
  });
} else {
  executeCommandString(commandString, context).then(result => {
    console.log(result.output);
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}