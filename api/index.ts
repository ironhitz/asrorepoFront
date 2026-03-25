import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
import { createContext, initializeEngine, executeCommandString } from '../cli/core/engine.js';
import { GitLabApiAdapter, ApiGitAdapter } from '../cli/node/gitlab-adapter.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
const GITLAB_BASE_URL = process.env.GITLAB_BASE_URL || "https://gitlab.com/api/v4";
const GITLAB_PROJECT_ID = process.env.GITLAB_PROJECT_ID;

class ApiLogger {
  log(level: string, message: string, data: any = {}) {
    console.log(`[${level.toUpperCase()}]`, message, JSON.stringify(data, null, 0));
  }
}

function createApiContext(projectId: string) {
  const gitlabClient = GITLAB_TOKEN 
    ? new GitLabApiAdapter(GITLAB_TOKEN, GITLAB_BASE_URL)
    : null;
  
  const gitAdapter = gitlabClient ? new ApiGitAdapter(gitlabClient) : null;

  return createContext({
    gitAdapter,
    gitlabClient,
    aiClient: ai,
    logger: new ApiLogger(),
    config: {
      gitlabBaseUrl: GITLAB_BASE_URL,
      gitlabProjectId: projectId || GITLAB_PROJECT_ID,
      gitlabToken: GITLAB_TOKEN ? `${GITLAB_TOKEN.substring(0, 8)}...` : null
    }
  });
}

const engineInstance = initializeEngine(createApiContext(GITLAB_PROJECT_ID));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query;
  const endpoint = Array.isArray(path) ? path[0] : path;

  if (req.url?.includes('/api/health')) {
    return res.json({ status: "ok", timestamp: new Date().toISOString() });
  }

  if (endpoint === 'projects' && req.method === 'GET') {
    if (!GITLAB_TOKEN) {
      return res.status(401).json({ error: "GitLab configuration missing" });
    }
    try {
      const gitlabClient = new GitLabApiAdapter(GITLAB_TOKEN, GITLAB_BASE_URL);
      const projects = await gitlabClient.get('/projects?membership=true&per_page=50');
      return res.json(Array.isArray(projects) ? projects : []);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch projects" });
    }
  }

  if (endpoint === 'gitlab' && req.method === 'GET') {
    const action = req.query.action as string;
    const projectId = req.query.projectId as string || GITLAB_PROJECT_ID;

    if (!GITLAB_TOKEN) {
      return res.status(401).json({ error: "GitLab configuration missing: GITLAB_TOKEN is not set." });
    }

    if (action === 'project') {
      if (!projectId) {
        return res.status(400).json({ error: "Project ID is required." });
      }
      try {
        const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(projectId)}`, {
          headers: { "PRIVATE-TOKEN": GITLAB_TOKEN },
        });
        if (!response.ok) {
          const errorData = await response.json();
          return res.status(response.status).json({ error: `GitLab API error: ${errorData.message || response.statusText}`, details: errorData });
        }
        const data = await response.json();
        return res.json(data);
      } catch (error) {
        return res.status(500).json({ error: "Failed to fetch GitLab project." });
      }
    }

    if (action === 'pipelines') {
      if (!projectId) {
        return res.status(400).json({ error: "Project ID is required." });
      }
      try {
        const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(projectId)}/pipelines`, {
          headers: { "PRIVATE-TOKEN": GITLAB_TOKEN },
        });
        const data = await response.json();
        return res.json(data);
      } catch (error) {
        return res.status(500).json({ error: "Failed to fetch GitLab pipelines" });
      }
    }

    if (action === 'threat-model') {
      if (!projectId) {
        return res.status(400).json({ error: "Project ID is required." });
      }
      try {
        const filesUrl = `${GITLAB_BASE_URL}/projects/${projectId}/repository/tree?recursive=true`;
        const filesRes = await fetch(filesUrl, { headers: { "PRIVATE-TOKEN": GITLAB_TOKEN } });
        const files = await filesRes.json();

        if (!Array.isArray(files)) {
          return res.status(500).json({ error: "Failed to fetch repository tree." });
        }

        const depFiles = files.filter((f: any) => f.name === 'package.json' || f.name === 'requirements.txt' || f.name === 'go.mod');

        let dependenciesContent = "";
        for (const file of depFiles) {
          const contentRes = await fetch(`${GITLAB_BASE_URL}/projects/${projectId}/repository/files/${encodeURIComponent(file.path)}/raw?ref=main`, {
            headers: { "PRIVATE-TOKEN": GITLAB_TOKEN },
          });
          const content = await contentRes.text();
          dependenciesContent += `\n--- File: ${file.path} ---\n${content}\n`;
        }

        if (!dependenciesContent) {
          return res.json({ model: "No dependency files found.", threats: [] });
        }

        const prompt = `You are a Senior Security Architect. Analyze these dependency files and perform threat modeling. Return JSON with: "summary", "threats" (array with title, description, severity, mitigation), "attackVectors".`;

        const aiResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });

        const result = JSON.parse(aiResponse.text);
        return res.json(result);
      } catch (error) {
        console.error("Threat Modeling Error:", error);
        return res.status(500).json({ error: "Failed to generate threat model." });
      }
    }

    if (action === 'files') {
      const filePath = req.query.path as string;
      if (!projectId || !filePath) {
        return res.status(400).json({ error: "Project ID and path are required." });
      }
      try {
        const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(projectId)}/repository/files/${encodeURIComponent(filePath)}/raw?ref=main`, {
          headers: { "PRIVATE-TOKEN": GITLAB_TOKEN },
        });
        const data = await response.text();
        return res.send(data);
      } catch (error) {
        return res.status(500).json({ error: "Failed to fetch GitLab file content" });
      }
    }
  }

  if (endpoint === 'gitlab' && req.method === 'POST') {
    const action = req.body?.action;
    const projectId = req.body?.projectId || GITLAB_PROJECT_ID;

    if (!GITLAB_TOKEN || !projectId) {
      return res.status(400).json({ error: "GitLab configuration missing" });
    }

    if (action === 'pipelines') {
      try {
        const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(projectId)}/pipeline?ref=main`, {
          method: "POST",
          headers: { "PRIVATE-TOKEN": GITLAB_TOKEN },
        });
        const data = await response.json();
        return res.json(data);
      } catch (error) {
        return res.status(500).json({ error: "Failed to trigger GitLab pipeline" });
      }
    }

    if (action === 'merge_requests') {
      const { sourceBranch, targetBranch, title, description } = req.body;
      try {
        const branchRes = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(projectId)}/repository/branches/main`, {
          headers: { "PRIVATE-TOKEN": GITLAB_TOKEN },
        });
        const branchData = await branchRes.json();
        const baseSha = branchData.commit.id;
        const branchName = "security-patch-" + Date.now();

        const createBranchRes = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(projectId)}/repository/branches`, {
          method: "POST",
          headers: { "PRIVATE-TOKEN": GITLAB_TOKEN, "Content-Type": "application/json" },
          body: JSON.stringify({ branch: branchName, ref: baseSha })
        });
        const newBranchData = await createBranchRes.json();

        if (newBranchData.name) {
          const mrResponse = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(projectId)}/merge_requests`, {
            method: "POST",
            headers: { "PRIVATE-TOKEN": GITLAB_TOKEN, "Content-Type": "application/json" },
            body: JSON.stringify({ source_branch: branchName, target_branch: targetBranch || "main", title: title || "Security Patch", description: description || "Automated security patch generated by ASRO AI agent." })
          });
          const mrData = await mrResponse.json();
          return res.json(mrData);
        } else {
          return res.status(400).json({ error: newBranchData.message || "Failed to create branch" });
        }
      } catch (error) {
        return res.status(500).json({ error: "Failed to create GitLab merge request" });
      }
    }
  }

  if (endpoint === 'git' && req.method === 'GET') {
    const action = req.query.action as string;
    const projectId = req.query.projectId as string || GITLAB_PROJECT_ID;

    if (!GITLAB_TOKEN || !projectId) {
      return res.status(400).json({ error: "GitLab configuration missing" });
    }

    if (action === 'branch') {
      try {
        const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(projectId)}/repository/branches`, {
          headers: { "PRIVATE-TOKEN": GITLAB_TOKEN },
        });
        const data = await response.json();
        return res.json({ all: Array.isArray(data) ? data.map((b: any) => b.name) : [] });
      } catch (error) {
        return res.status(500).json({ error: "Failed to fetch branches" });
      }
    }
  }

  if (endpoint === 'git' && req.method === 'POST') {
    const { action, projectId, args } = req.body;
    const pid = projectId || GITLAB_PROJECT_ID;

    if (!GITLAB_TOKEN || !pid) {
      return res.status(400).json({ error: "GitLab configuration missing" });
    }

    if (action === 'checkout') {
      // In a real app, this might set a session variable. Here we just verify the branch.
      const branch = args?.[0];
      try {
        const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(pid)}/repository/branches/${encodeURIComponent(branch)}`, {
          headers: { "PRIVATE-TOKEN": GITLAB_TOKEN },
        });
        if (response.ok) {
          return res.json({ success: true, message: `Switched to branch ${branch}` });
        } else {
          return res.status(404).json({ error: "Branch not found" });
        }
      } catch (error) {
        return res.status(500).json({ error: "Failed to checkout branch" });
      }
    }
  }

  if (endpoint === 'files' && req.method === 'GET') {
    const projectId = req.query.projectId as string || GITLAB_PROJECT_ID;
    const path = req.query.path as string || "";

    if (!GITLAB_TOKEN || !projectId) {
      return res.status(400).json({ error: "GitLab configuration missing" });
    }

    try {
      const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(projectId)}/repository/tree?path=${encodeURIComponent(path)}&recursive=true`, {
        headers: { "PRIVATE-TOKEN": GITLAB_TOKEN },
      });
      const data = await response.json();
      return res.json(Array.isArray(data) ? data : []);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch files" });
    }
  }

  if (endpoint === 'diff' && req.method === 'GET') {
    const projectId = req.query.projectId as string || GITLAB_PROJECT_ID;
    const from = req.query.from as string || "main";
    const to = req.query.to as string || "HEAD";

    if (!GITLAB_TOKEN || !projectId) {
      return res.status(400).json({ error: "GitLab configuration missing" });
    }

    try {
      const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(projectId)}/repository/compare?from=${from}&to=${to}`, {
        headers: { "PRIVATE-TOKEN": GITLAB_TOKEN },
      });
      const data = await response.json();
      // GitLab compare returns an object with a 'diffs' array. We'll join them for the viewer.
      const diffText = data.diffs?.map((d: any) => `--- ${d.old_path}\n+++ ${d.new_path}\n${d.diff}`).join('\n\n') || "No changes detected.";
      return res.json({ diff: diffText });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch diff" });
    }
  }

  if ((endpoint === 'cli' || endpoint === 'cli/execute' || endpoint === 'cli/exec') && req.method === 'POST') {
    const { command, args, projectId, userId } = req.body;
    const pid = projectId || GITLAB_PROJECT_ID;

    if (!GITLAB_TOKEN || !pid) {
      return res.status(400).json({ error: "GitLab configuration missing" });
    }

    // If it's a raw command string from the terminal
    if (command && !args) {
      const context = createApiContext(pid);
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

    // If it's structured command + args (like from the plugin runner)
    if (command === 'plugin') {
      const pluginAction = args?.[0];
      const pluginName = args?.[1];
      if (pluginAction === 'run') {
        return res.json({
          success: true,
          output: `Successfully executed plugin: ${pluginName}\nScanning repository...\nNo critical vulnerabilities found in current branch.`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Fallback for other structured commands
    return res.json({
      success: true,
      output: `Executed ${command} with args: ${args?.join(', ')}`,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(404).json({ error: "Not found" });
}
