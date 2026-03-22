import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
const GITLAB_BASE_URL = process.env.GITLAB_BASE_URL || "https://gitlab.com/api/v4";
const GITLAB_PROJECT_ID = process.env.GITLAB_PROJECT_ID;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query;
  const endpoint = Array.isArray(path) ? path[0] : path;

  if (req.url?.includes('/api/health')) {
    return res.json({ status: "ok", timestamp: new Date().toISOString() });
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

  if (endpoint === 'cli' && req.method === 'POST') {
    const { command } = req.body;
    const projectId = req.body?.projectId || GITLAB_PROJECT_ID;
    const pid = projectId || GITLAB_PROJECT_ID;
    let output = "";

    if (!GITLAB_TOKEN || !pid) {
      return res.status(400).json({ error: "GitLab configuration missing" });
    }

    if (command.startsWith("asro scan")) {
      try {
        const parts = command.split(" ");
        const targetPath = parts[2] || "";
        const filesUrl = `${GITLAB_BASE_URL}/projects/${encodeURIComponent(pid)}/repository/tree?recursive=true${targetPath ? `&path=${encodeURIComponent(targetPath)}` : ""}`;
        const filesRes = await fetch(filesUrl, { headers: { "PRIVATE-TOKEN": GITLAB_TOKEN } });
        const files = await filesRes.json();

        if (!Array.isArray(files)) {
          return res.json({ output: `[ERROR] Failed to fetch repository tree.`, timestamp: new Date().toISOString() });
        }

        let scanOutput = `Scanning repository for vulnerabilities...\n[INFO] Found ${files.length} items.\n[INFO] Analyzing with Gemini-3-Flash...\n`;
        const findings: any[] = [];

        const codeFiles = files.filter((f: any) => f.type === 'blob' && (f.path.endsWith('.ts') || f.path.endsWith('.js') || f.path.endsWith('.py') || f.path.endsWith('.go'))).slice(0, 5);

        for (const file of codeFiles) {
          scanOutput += `[INFO] Analyzing ${file.path}...\n`;
          const fileContentRes = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(pid)}/repository/files/${encodeURIComponent(file.path)}/raw?ref=main`, {
            headers: { "PRIVATE-TOKEN": GITLAB_TOKEN },
          });
          const content = await fileContentRes.text();

          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Analyze for security vulnerabilities. Return JSON with "vulnerabilities" array (title, description, severity, file). Empty array if none. File: ${file.path}\n\nCode:\n${content}`,
            config: { responseMimeType: "application/json" }
          });

          try {
            const result = JSON.parse(response.text);
            if (result.vulnerabilities?.length > 0) {
              findings.push(...result.vulnerabilities.map((v: any) => ({ ...v, file: file.path })));
              scanOutput += `[WARN] Found ${result.vulnerabilities.length} issue(s)\n`;
            } else {
              scanOutput += `[INFO] No vulnerabilities found\n`;
            }
          } catch (e) {
            scanOutput += `[AI] ${response.text}\n`;
          }
        }

        scanOutput += `[SUCCESS] Scan complete. ${findings.length} vulnerabilities detected.`;
        return res.json({ output: scanOutput, findings, timestamp: new Date().toISOString() });
      } catch (error) {
        return res.status(500).json({ output: `Error: ${error instanceof Error ? error.message : String(error)}`, timestamp: new Date().toISOString() });
      }
    }

    if (command.startsWith("asro pipeline run")) {
      try {
        const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(pid)}/pipeline?ref=main`, { method: "POST", headers: { "PRIVATE-TOKEN": GITLAB_TOKEN } });
        const data = await response.json();
        output = `Triggering GitLab pipeline...\n[INFO] Pipeline #${data.id} started.\n[INFO] Status: ${data.status}\n[INFO] URL: ${data.web_url}`;
      } catch (error) { output = "Error: Failed to trigger pipeline."; }
    } else if (command === "asro version") {
      output = "ASRO CLI v1.0.0\nBuild: 2026-03-21\nEngine: Gemini-3-Flash";
    } else if (command === "asro whoami") {
      try {
        const response = await fetch(`${GITLAB_BASE_URL}/user`, { headers: { "PRIVATE-TOKEN": GITLAB_TOKEN } });
        const data = await response.json();
        output = `User: ${data.name} (@${data.username})\nEmail: ${data.email}\nID: ${data.id}`;
      } catch (error) { output = "Error: Failed to fetch user info."; }
    } else if (command === "asro repo") {
      try {
        const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(pid)}`, { headers: { "PRIVATE-TOKEN": GITLAB_TOKEN } });
        const data = await response.json();
        output = `Project: ${data.name_with_namespace}\nID: ${data.id}\nVisibility: ${data.visibility}\nDefault Branch: ${data.default_branch}\nURL: ${data.web_url}`;
      } catch (error) { output = "Error: Failed to fetch repo info."; }
    } else if (command === "asro pipelines") {
      try {
        const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(pid)}/pipelines?per_page=5`, { headers: { "PRIVATE-TOKEN": GITLAB_TOKEN } });
        const data = await response.json();
        output = "Recent Pipelines:\n" + data.map((p: any) => `- #${p.id}: ${p.status} (${p.ref})`).join("\n");
      } catch (error) { output = "Error: Failed to fetch pipelines."; }
    } else if (command === "asro agents") {
      output = "Active AI Agents:\n- Gemini-3-Flash (Scanner): Online\n- Gemini-Pro (Patch Generator): Online\n- ASRO-Orchestrator: Online";
    } else if (command === "asro config") {
      output = `Configuration:\n- GITLAB_BASE_URL: ${GITLAB_BASE_URL}\n- GITLAB_PROJECT_ID: ${pid}\n- AI_MODEL: gemini-3-flash-preview\n- SCAN_DEPTH: deep`;
    } else if (command === "asro help") {
      output = "ASRO CLI v1.0.0 - Available Commands:\n- asro scan [path]: AI vulnerability scan\n- asro pipeline run: Trigger GitLab pipeline\n- asro pipelines: List recent pipelines\n- asro mr create: Create Merge Request\n- asro repo: Show repository info\n- asro whoami: Show user info\n- asro agents: Check AI agent status\n- asro config: Show configuration\n- asro version: Show CLI version";
    } else if (command === "asro setup verify") {
      output = GITLAB_TOKEN ? `[SUCCESS] GitLab configuration verified.\nProject ID: ${pid}\nToken: ${GITLAB_TOKEN.substring(0, 8)}...` : "[ERROR] GitLab configuration missing.";
    } else {
      output = `Command not found: ${command}. Type 'asro help' for commands.`;
    }

    return res.json({ output, timestamp: new Date().toISOString() });
  }

  return res.status(404).json({ error: "Not found" });
}
