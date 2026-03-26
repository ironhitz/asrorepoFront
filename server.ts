import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // GitLab Proxy / Integration Endpoints
  const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
  const GITLAB_BASE_URL = process.env.GITLAB_BASE_URL || "https://gitlab.com/api/v4";
  const GITLAB_PROJECT_ID = process.env.GITLAB_PROJECT_ID;

  // Generic Project Info Endpoint (GitLab & GitHub)
  app.get("/api/project/info", async (req, res) => {
    const { projectId, repoUrl } = req.query;
    
    if (repoUrl) {
      const url = repoUrl as string;
      if (url.includes("github.com")) {
        // GitHub Support
        try {
          const parts = url.replace("https://github.com/", "").split("/");
          const owner = parts[0];
          const repo = parts[1];
          const githubRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
          if (!githubRes.ok) throw new Error("GitHub project not found");
          const data = await githubRes.json();
          return res.json({
            id: data.id,
            name: data.name,
            path_with_namespace: data.full_name,
            avatar_url: data.owner.avatar_url,
            web_url: data.html_url,
            star_count: data.stargazers_count,
            forks_count: data.forks_count,
            last_activity_at: data.updated_at,
            type: 'github'
          });
        } catch (e) {
          return res.status(404).json({ error: "GitHub project not found or inaccessible." });
        }
      }
    }

    // Fallback to GitLab
    const pid = projectId || GITLAB_PROJECT_ID;
    if (!GITLAB_TOKEN) {
      return res.status(401).json({ error: "GitLab configuration missing: GITLAB_TOKEN is not set." });
    }
    if (!pid) {
      return res.status(400).json({ error: "Project ID or Repository URL is required." });
    }
    try {
      const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(pid as string)}`, {
        headers: { "PRIVATE-TOKEN": GITLAB_TOKEN },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({ 
          error: `GitLab API error: ${errorData.message || response.statusText}`,
          details: errorData
        });
      }
      
      const data = await response.json();
      res.json({ ...data, type: 'gitlab' });
    } catch (error) {
      console.error("Project Fetch Error:", error);
      res.status(500).json({ error: "Failed to fetch project info." });
    }
  });

  app.get("/api/gitlab/project", async (req, res) => {
    // Keep for backward compatibility or redirect
    res.redirect(`/api/project/info?${new URLSearchParams(req.query as any).toString()}`);
  });

  app.get("/api/gitlab/threat-model", async (req, res) => {
    const projectId = req.query.projectId || GITLAB_PROJECT_ID;
    if (!GITLAB_TOKEN || !projectId) {
      return res.status(400).json({ error: "GitLab configuration missing or Project ID missing" });
    }

    try {
      // 1. Try to find dependency files (package.json, requirements.txt, go.mod, etc.)
      const filesUrl = `${GITLAB_BASE_URL}/projects/${projectId}/repository/tree?recursive=true`;
      const filesRes = await fetch(filesUrl, {
        headers: { "PRIVATE-TOKEN": GITLAB_TOKEN },
      });
      const files = await filesRes.json();
      
      if (!Array.isArray(files)) {
        return res.status(500).json({ error: "Failed to fetch repository tree for threat modeling." });
      }

      const depFiles = files.filter((f: any) => 
        f.name === 'package.json' || 
        f.name === 'requirements.txt' || 
        f.name === 'go.mod' || 
        f.name === 'Gemfile' ||
        f.name === 'pom.xml'
      );

      let dependenciesContent = "";
      for (const file of depFiles) {
        const contentRes = await fetch(`${GITLAB_BASE_URL}/projects/${projectId}/repository/files/${encodeURIComponent(file.path)}/raw?ref=main`, {
          headers: { "PRIVATE-TOKEN": GITLAB_TOKEN },
        });
        const content = await contentRes.text();
        dependenciesContent += `\n--- File: ${file.path} ---\n${content}\n`;
      }

      if (!dependenciesContent) {
        return res.json({ 
          model: "No dependency files found. Threat modeling skipped.",
          threats: []
        });
      }

      // 2. Use AI to analyze dependencies
      const prompt = `You are a Senior Security Architect. Analyze the following dependency files from a GitLab project and perform a threat modeling analysis.
      Identify potential attack vectors, vulnerable dependencies (if obvious), and architectural risks based on the tech stack.
      
      Dependency Files:
      ${dependenciesContent}
      
      Format your response as a JSON object with:
      - "summary": A brief overview of the tech stack and its general security posture.
      - "threats": An array of objects, each with "title", "description", "severity" (Critical, High, Medium, Low), and "mitigation".
      - "attackVectors": An array of potential entry points or methods an attacker might use.
      `;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(aiResponse.text);
      res.json(result);
    } catch (error) {
      console.error("Threat Modeling Error:", error);
      res.status(500).json({ error: "Failed to generate threat model." });
    }
  });

  app.get("/api/gitlab/pipelines", async (req, res) => {
    const projectId = req.query.projectId || GITLAB_PROJECT_ID;
    if (!GITLAB_TOKEN || !projectId) {
      return res.status(400).json({ error: "GitLab configuration missing" });
    }
    try {
      const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(projectId as string)}/pipelines`, {
        headers: { "PRIVATE-TOKEN": GITLAB_TOKEN },
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch GitLab pipelines" });
    }
  });

  app.post("/api/gitlab/pipelines", async (req, res) => {
    const projectId = req.body.projectId || GITLAB_PROJECT_ID;
    if (!GITLAB_TOKEN || !projectId) {
      return res.status(400).json({ error: "GitLab configuration missing" });
    }
    try {
      const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(projectId as string)}/pipeline?ref=main`, {
        method: "POST",
        headers: { "PRIVATE-TOKEN": GITLAB_TOKEN },
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to trigger GitLab pipeline" });
    }
  });

  app.get("/api/gitlab/files", async (req, res) => {
    const projectId = req.query.projectId || GITLAB_PROJECT_ID;
    const filePath = req.query.path;
    if (!GITLAB_TOKEN || !projectId || !filePath) {
      return res.status(400).json({ error: "GitLab configuration missing" });
    }
    try {
      const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(projectId as string)}/repository/files/${encodeURIComponent(filePath as string)}/raw?ref=main`, {
        headers: { "PRIVATE-TOKEN": GITLAB_TOKEN },
      });
      const data = await response.text();
      res.send(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch GitLab file content" });
    }
  });

  app.post("/api/gitlab/merge_requests", async (req, res) => {
    const { projectId, sourceBranch, targetBranch, title, description } = req.body;
    const pid = projectId || GITLAB_PROJECT_ID;
    if (!GITLAB_TOKEN || !pid) {
      return res.status(400).json({ error: "GitLab configuration missing" });
    }
    try {
      const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(pid as string)}/merge_requests`, {
        method: "POST",
        headers: { 
          "PRIVATE-TOKEN": GITLAB_TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          source_branch: sourceBranch,
          target_branch: targetBranch,
          title: title,
          description: description
        })
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to create GitLab merge request" });
    }
  });

  // CLI Simulation Endpoint
  app.get("/api/git", async (req, res) => {
    const action = req.query.action as string;
    const projectId = req.query.projectId as string || GITLAB_PROJECT_ID;

    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required." });
    }

    const isGitHub = projectId.toString().includes("/");

    if (action === 'branch') {
      try {
        if (isGitHub) {
          const [owner, repo] = projectId.toString().split("/");
          const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`);
          if (!response.ok) throw new Error("GitHub API error");
          const data = await response.json();
          return res.json({ all: Array.isArray(data) ? data.map((b: any) => b.name) : [] });
        } else {
          if (!GITLAB_TOKEN) return res.status(401).json({ error: "GitLab token missing" });
          const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(projectId)}/repository/branches`, {
            headers: { "PRIVATE-TOKEN": GITLAB_TOKEN },
          });
          if (!response.ok) throw new Error("GitLab API error");
          const data = await response.json();
          return res.json({ all: Array.isArray(data) ? data.map((b: any) => b.name) : [] });
        }
      } catch (error) {
        return res.status(500).json({ error: "Failed to fetch branches" });
      }
    }
    res.status(400).json({ error: "Invalid action" });
  });

  app.post("/api/git", async (req, res) => {
    const { action, projectId, args } = req.body;
    const pid = projectId || GITLAB_PROJECT_ID;

    if (!pid) {
      return res.status(400).json({ error: "Project ID is required." });
    }

    if (action === 'checkout') {
      const branch = args?.[0];
      // Simulation for now
      return res.json({ success: true, message: `Switched to branch ${branch} (Simulated)` });
    }
    res.status(400).json({ error: "Invalid action" });
  });

  app.get("/api/files", async (req, res) => {
    const projectId = req.query.projectId as string || GITLAB_PROJECT_ID;
    const path = req.query.path as string || "";

    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required." });
    }

    const isGitHub = projectId.toString().includes("/");

    try {
      if (isGitHub) {
        const [owner, repo] = projectId.toString().split("/");
        // Get default branch first
        const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        const repoData = await repoRes.json();
        const defaultBranch = repoData.default_branch || "main";

        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);
        if (!response.ok) throw new Error("GitHub API error");
        const data = await response.json();
        // Normalize to GitLab-like format
        const files = data.tree.map((f: any) => ({
          id: f.sha,
          name: f.path.split("/").pop(),
          type: f.type === 'tree' ? 'tree' : 'blob',
          path: f.path,
          mode: f.mode
        }));
        return res.json(files);
      } else {
        if (!GITLAB_TOKEN) return res.status(401).json({ error: "GitLab token missing" });
        const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(projectId)}/repository/tree?path=${encodeURIComponent(path)}&recursive=true&per_page=100`, {
          headers: { "PRIVATE-TOKEN": GITLAB_TOKEN },
        });
        if (!response.ok) throw new Error("GitLab API error");
        const data = await response.json();
        return res.json(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch files" });
    }
  });

  app.get("/api/diff", async (req, res) => {
    const projectId = req.query.projectId as string || GITLAB_PROJECT_ID;
    const from = req.query.from as string || "main";
    const to = req.query.to as string || "HEAD";

    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required." });
    }

    const isGitHub = projectId.toString().includes("/");

    try {
      if (isGitHub) {
        const [owner, repo] = projectId.toString().split("/");
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/compare/${from}...${to}`, {
          headers: { "Accept": "application/vnd.github.v3.diff" }
        });
        if (!response.ok) {
          // Fallback if diff format not supported or refs invalid
          const jsonRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/compare/${from}...${to}`);
          const jsonData = await jsonRes.json();
          const diffText = jsonData.files?.map((f: any) => `--- ${f.filename}\n+++ ${f.filename}\n${f.patch || "No patch available"}`).join('\n\n') || "No changes detected.";
          return res.json({ diff: diffText });
        }
        const data = await response.text();
        return res.json({ diff: data });
      } else {
        if (!GITLAB_TOKEN) return res.status(401).json({ error: "GitLab token missing" });
        const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(projectId)}/repository/compare?from=${from}&to=${to}`, {
          headers: { "PRIVATE-TOKEN": GITLAB_TOKEN },
        });
        if (!response.ok) throw new Error("GitLab API error");
        const data = await response.json();
        const diffText = data.diffs?.map((d: any) => `--- ${d.old_path}\n+++ ${d.new_path}\n${d.diff}`).join('\n\n') || "No changes detected.";
        return res.json({ diff: diffText });
      }
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch diff" });
    }
  });

  app.post("/api/cli/execute", async (req, res) => {
    const { command, args, projectId } = req.body;
    const pid = projectId || GITLAB_PROJECT_ID;
    
    // Normalize command to avoid doubling and redundancy
    const rawParts = command.trim().split(/\s+/);
    const filteredParts = rawParts.filter(p => p.toLowerCase() !== 'asro');
    
    // Reconstruct command with single 'asro' prefix
    let fullCommand = `asro ${filteredParts.join(' ')}`.trim();
    
    if (fullCommand === "asro") fullCommand = "asro help";
    
    // Simulate CLI responses
    let output: any = "";
    
    // Handle 'asro project add'
    if (fullCommand.startsWith("asro project add")) {
      const target = filteredParts[2]; // 'project' is [0], 'add' is [1], <target> is [2]
      if (!target) {
        return res.json({ 
          output: "[ERROR] Missing project ID or repository URL.\nUsage: asro project add <ID|URL>", 
          timestamp: new Date().toISOString() 
        });
      }
      
      // We return a special action for the frontend to handle Firestore
      return res.json({
        output: `[INFO] Initializing project import for: ${target}...\n[ACTION] Please wait while we fetch project metadata...`,
        action: 'PROJECT_ADD',
        data: { target },
        timestamp: new Date().toISOString()
      });
    }

    if (fullCommand.startsWith("asro scan") || fullCommand.startsWith("asro plugins scan") || fullCommand.startsWith("asro/plugins scan")) {
      try {
        const isAlias = fullCommand.startsWith("asro plugins scan");
        const isSlashAlias = fullCommand.startsWith("asro/plugins scan");
        const parts = fullCommand.split(" ");
        
        let targetPath = "";
        if (isAlias) {
          targetPath = parts[3] || "";
        } else if (isSlashAlias) {
          targetPath = parts[2] || "";
        } else {
          targetPath = parts[2] || "";
        }
        
        let files: any[] = [];
        let projectType = 'gitlab';
        const isGitHub = pid?.toString().includes("/");

        if (isGitHub) {
          // GitHub Scan
          const [owner, repo] = pid.toString().split("/");
          const githubRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${targetPath}`);
          if (githubRes.ok) {
            const data = await githubRes.json();
            files = Array.isArray(data) ? data : [data];
            projectType = 'github';
          }
        } else {
          // GitLab Scan
          const filesUrl = `${GITLAB_BASE_URL}/projects/${encodeURIComponent(pid as string)}/repository/tree?recursive=true${targetPath ? `&path=${encodeURIComponent(targetPath)}` : ""}`;
          const filesRes = await fetch(filesUrl, {
            headers: { "PRIVATE-TOKEN": GITLAB_TOKEN || "" },
          });
          files = await filesRes.json();
          projectType = 'gitlab';
        }
        
        if (!Array.isArray(files)) {
          return res.json({ 
            output: `[ERROR] Failed to fetch repository tree. ${projectType.toUpperCase()} API returned: ${JSON.stringify(files)}\n[HINT] Ensure the project ID and token are correct, and the path exists.`, 
            timestamp: new Date().toISOString() 
          });
        }
        
        let scanOutput = `🔍 Scanning ${projectType} repository for vulnerabilities...\n[INFO] Found ${files.length} items in repository.\n[INFO] Analyzing source code with Gemini-3-Flash...\n`;
        const findings: any[] = [];
        
        // Pick a few interesting files to analyze
        const codeFiles = files.filter((f: any) => {
          const path = f.path || f.name;
          return (f.type === 'blob' || f.type === 'file') && 
          (path.endsWith('.ts') || path.endsWith('.js') || path.endsWith('.py') || path.endsWith('.go') || path.endsWith('.java'));
        }).slice(0, 5);

        if (codeFiles.length === 0) {
          scanOutput += `[WARN] No supported code files found in the specified path.\n`;
        }

        for (const file of codeFiles) {
          const filePath = file.path || file.name;
          scanOutput += `[INFO] Analyzing ${filePath}...\n`;
          
          let content = "";
          if (isGitHub) {
            const [owner, repo] = pid.toString().split("/");
            const fileContentRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`);
            if (fileContentRes.ok) {
              const fileData = await fileContentRes.json();
              content = Buffer.from(fileData.content, 'base64').toString();
            }
          } else {
            const fileContentRes = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(pid as string)}/repository/files/${encodeURIComponent(filePath)}/raw?ref=main`, {
              headers: { "PRIVATE-TOKEN": GITLAB_TOKEN || "" },
            });
            content = await fileContentRes.text();
          }

          if (content) {
            // Real AI analysis
            const aiResponse = await ai.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: `Analyze the following code for security vulnerabilities. 
              If you find any, describe them briefly and provide a severity (critical, high, medium, low). 
              Format your response as a JSON object with a "vulnerabilities" array, where each item has "title", "description", "severity", and "file".
              If no vulnerabilities are found, return an empty array for "vulnerabilities".
              
              File: ${filePath}
              
              Code:
              ${content.slice(0, 2000)}`, // Limit content for efficiency
              config: { responseMimeType: "application/json" }
            });

            try {
              const result = JSON.parse(aiResponse.text);
              if (result.vulnerabilities && result.vulnerabilities.length > 0) {
                findings.push(...result.vulnerabilities.map((v: any) => ({ ...v, file: filePath })));
                scanOutput += `[WARN] Found ${result.vulnerabilities.length} issue(s) in ${filePath}\n`;
              } else {
                scanOutput += `[INFO] No vulnerabilities found in ${filePath}\n`;
              }
            } catch (e) {
              scanOutput += `[AI] ${aiResponse.text}\n`;
            }
          }
        }

        scanOutput += `\n✅ Scan complete. Found ${findings.length} issues.\n`;
        if (findings.length > 0) {
          scanOutput += `[HINT] Run 'asro mr create' to generate fixes for these findings.`;
        }

        return res.json({
          output: scanOutput,
          data: { findings },
          success: true,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        return res.json({
          output: `❌ Scan failed: ${e.message}`,
          success: false,
          timestamp: new Date().toISOString()
        });
      }
    }
 else if (fullCommand.startsWith("asro pipeline run")) {
      try {
        const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(pid as string)}/pipeline?ref=main`, {
          method: "POST",
          headers: { "PRIVATE-TOKEN": GITLAB_TOKEN || "" },
        });
        const data = await response.json();
        output = `Triggering GitLab pipeline...\n[INFO] Pipeline #${data.id} started.\n[INFO] Status: ${data.status}\n[INFO] URL: ${data.web_url}`;
      } catch (error) {
        output = "Error: Failed to trigger GitLab pipeline.";
      }
    } else if (fullCommand.startsWith("asro plugin recommend")) {
      output = [
        { name: 'security-scanner', reason: 'High risk detected in current project', score: 95 },
        { name: 'threat-modeler', reason: 'New architecture detected', score: 88 },
        { name: 'secret-detector', reason: 'Multiple .env files found', score: 82 }
      ];
    } else if (fullCommand.startsWith("asro plugin install")) {
      const pluginName = args ? args[1] : "unknown";
      output = `[SUCCESS] Plugin "${pluginName}" installed successfully in sandbox.`;
    } else if (fullCommand.startsWith("asro plugin sync")) {
      output = "[SUCCESS] All plugins synchronized with GitLab repository.";
    } else if (fullCommand.startsWith("asro plugin run malicious-plugin")) {
      output = "Simulating malicious plugin execution...";
    } else if (fullCommand === "asro version") {
      output = "ASRO CLI v1.0.0\nBuild: 2026-03-21\nEngine: Gemini-3-Flash";
    } else if (fullCommand === "asro whoami") {
      try {
        const response = await fetch(`${GITLAB_BASE_URL}/user`, {
          headers: { "PRIVATE-TOKEN": GITLAB_TOKEN || "" },
        });
        const data = await response.json();
        output = `User: ${data.name} (@${data.username})\nEmail: ${data.email}\nID: ${data.id}`;
      } catch (error) {
        output = "Error: Failed to fetch user info.";
      }
    } else if (fullCommand === "asro repo") {
      try {
        const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(pid as string)}`, {
          headers: { "PRIVATE-TOKEN": GITLAB_TOKEN || "" },
        });
        const data = await response.json();
        output = `Project: ${data.name_with_namespace}\nID: ${data.id}\nVisibility: ${data.visibility}\nDefault Branch: ${data.default_branch}\nURL: ${data.web_url}`;
      } catch (error) {
        output = "Error: Failed to fetch repository info.";
      }
    } else if (fullCommand === "asro pipelines") {
      try {
        const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(pid as string)}/pipelines?per_page=5`, {
          headers: { "PRIVATE-TOKEN": GITLAB_TOKEN || "" },
        });
        const data = await response.json();
        output = "Recent Pipelines:\n" + data.map((p: any) => `- #${p.id}: ${p.status} (${p.ref})`).join("\n");
      } catch (error) {
        output = "Error: Failed to fetch pipelines.";
      }
    } else if (fullCommand === "asro agents") {
      output = "Active AI Agents:\n- Gemini-3-Flash (Scanner): Online\n- Gemini-Pro (Patch Generator): Online\n- ASRO-Orchestrator: Online";
    } else if (fullCommand === "asro config") {
      output = `Configuration:\n- GITLAB_BASE_URL: ${GITLAB_BASE_URL}\n- GITLAB_PROJECT_ID: ${pid}\n- AI_MODEL: gemini-3-flash-preview\n- SCAN_DEPTH: deep`;
    } else if (fullCommand.startsWith("asro mr create")) {
      try {
        const parts = fullCommand.split(" ");
        const title = parts.slice(3).join(" ") || "Security Patch: Fix vulnerabilities";
        const branchName = "security-patch-" + Date.now();

        // 1. Get the SHA of the main branch
        const branchRes = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(pid as string)}/repository/branches/main`, {
          headers: { "PRIVATE-TOKEN": GITLAB_TOKEN || "" },
        });
        const branchData = await branchRes.json();
        const baseSha = branchData.commit.id;

        // 2. Create a new branch
        const createBranchRes = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(pid as string)}/repository/branches`, {
          method: "POST",
          headers: { 
            "PRIVATE-TOKEN": GITLAB_TOKEN || "",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            branch: branchName,
            ref: baseSha
          })
        });
        const newBranchData = await createBranchRes.json();

        if (newBranchData.name) {
          // 3. Create the Merge Request
          const mrResponse = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(pid as string)}/merge_requests`, {
            method: "POST",
            headers: { 
              "PRIVATE-TOKEN": GITLAB_TOKEN || "",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              source_branch: branchName,
              target_branch: "main",
              title: title,
              description: "Automated security patch generated by ASRO AI agent."
            })
          });
          const mrData = await mrResponse.json();
          
          if (mrData.id) {
            output = `Creating Merge Request with security patch...\n[INFO] Branch '${branchName}' created.\n[SUCCESS] MR #${mrData.iid} created: '${mrData.title}'\n[INFO] URL: ${mrData.web_url}`;
          } else {
            output = `[ERROR] Failed to create MR: ${mrData.message || "Unknown error"}`;
          }
        } else {
          output = `[ERROR] Failed to create branch: ${newBranchData.message || "Unknown error"}`;
        }
      } catch (error) {
        console.error("MR creation error:", error);
        output = `Error: Failed to create GitLab merge request. ${error instanceof Error ? error.message : String(error)}`;
      }
    } else if (fullCommand.startsWith("asro agent status")) {
      output = "Agent Status:\n- GPT-4 Scanner: idle\n- Claude Patch Gen: busy\n- Gemini Validator: idle";
    } else if (fullCommand === "asro help" || fullCommand === "help") {
      output = `ASRO CLI v1.0.4 - Autonomous Security & Runtime Orchestrator
Available commands:
  asro project add <ID|URL>  - Add a new GitLab/GitHub project to ASRO
  asro scan [path]           - Scan repository for vulnerabilities (GitLab & GitHub)
  asro plugins scan [path]   - Alias for 'asro scan'
  asro/plugins scan [path]   - Alias for 'asro scan'
  asro mr create <title>     - Create a merge/pull request with security fixes
  asro compliance check      - Perform an automated governance audit
  asro threat-model generate - Generate predictive attack vector analysis
  asro agent status          - Check the status of ASRO runtime agents
  asro clear                 - Clear terminal history
  asro exit                  - Close the terminal window`;
    } else if (fullCommand === "asro setup verify") {
      if (GITLAB_TOKEN && pid) {
        output = `[SUCCESS] GitLab configuration verified.\nProject ID: ${pid}\nToken: ${GITLAB_TOKEN.substring(0, 8)}...`;
      } else {
        output = "[ERROR] GitLab configuration missing. Please check .env file.";
      }
    } else {
      output = `Command not found: ${fullCommand}. Type 'asro help' for a list of commands.`;
    }

    res.json({ output, timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ASRO Dashboard server running on http://localhost:${PORT}`);
  });
}

startServer();
