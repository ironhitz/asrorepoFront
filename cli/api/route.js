import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createContext, initializeEngine, executeCommandString } from '../core/engine.js';
import { GitLabApiAdapter, ApiGitAdapter } from '../node/gitlab-adapter.js';

const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
const GITLAB_BASE_URL = process.env.GITLAB_BASE_URL || 'https://gitlab.com/api/v4';
const GITLAB_PROJECT_ID = process.env.GITLAB_PROJECT_ID;

class ApiLogger {
  log(level, message, data) {
    console.log(`[${level.toUpperCase()}]`, message, JSON.stringify(data, null, 0));
  }
}

let aiClient = null;

try {
  const { GoogleGenAI } = await import('@google/genai');
  if (process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (e) {
  console.warn('AI client not available');
}

const logger = new ApiLogger();

function createApiContext(projectId) {
  const gitlabClient = GITLAB_TOKEN 
    ? new GitLabApiAdapter(GITLAB_TOKEN, GITLAB_BASE_URL)
    : null;
  
  const gitAdapter = gitlabClient ? new ApiGitAdapter(gitlabClient) : null;

  return createContext({
    gitAdapter,
    gitlabClient,
    aiClient,
    logger,
    config: {
      gitlabBaseUrl: GITLAB_BASE_URL,
      gitlabProjectId: projectId || GITLAB_PROJECT_ID,
      gitlabToken: GITLAB_TOKEN ? `${GITLAB_TOKEN.substring(0, 8)}...` : null
    }
  });
}

const engineInstance = initializeEngine(createApiContext(GITLAB_PROJECT_ID));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.url?.includes('/api/health')) {
    return res.json({ status: 'ok', timestamp: new Date().toISOString() });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { command } = req.body;
  const projectId = req.body?.projectId || GITLAB_PROJECT_ID;

  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  if (!GITLAB_TOKEN || !projectId) {
    return res.status(400).json({ error: 'GitLab configuration missing' });
  }

  const context = createApiContext(projectId);
  
  try {
    const result = await executeCommandString(command, context);
    
    return res.json({
      success: result.success,
      output: result.output,
      data: result.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      output: `Error: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date().toISOString()
    });
  }
}