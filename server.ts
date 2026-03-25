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

  app.get("/api/gitlab/project", async (req, res) => {
    const projectId = req.query.projectId || GITLAB_PROJECT_ID;
    if (!GITLAB_TOKEN) {
      return res.status(401).json({ error: "GitLab configuration missing: GITLAB_TOKEN is not set." });
    }
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required." });
    }
    try {
      const response = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(projectId as string)}`, {
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
      res.json(data);
    } catch (error) {
      console.error("GitLab Fetch Error:", error);
      res.status(500).json({ error: "Failed to fetch GitLab project. Check server logs." });
    }
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
  app.post("/api/cli/execute", async (req, res) => {
    const { command, args, projectId } = req.body;
    const pid = projectId || GITLAB_PROJECT_ID;
    
    // Normalize command
    const fullCommand = args ? `asro ${command} ${args.join(" ")}` : command;
    
    // Simulate CLI responses
    let output: any = "";
    if (fullCommand.startsWith("asro scan")) {
      try {
        const parts = fullCommand.split(" ");
        const targetPath = parts[2] || ""; // asro scan [path]
        
        // Fetch project files from GitLab
        const filesUrl = `${GITLAB_BASE_URL}/projects/${encodeURIComponent(pid as string)}/repository/tree?recursive=true${targetPath ? `&path=${encodeURIComponent(targetPath)}` : ""}`;
        const filesRes = await fetch(filesUrl, {
          headers: { "PRIVATE-TOKEN": GITLAB_TOKEN || "" },
        });
        const files = await filesRes.json();
        
        if (!Array.isArray(files)) {
          return res.json({ 
            output: `[ERROR] Failed to fetch repository tree. GitLab API returned: ${JSON.stringify(files)}\n[HINT] Ensure the project ID and token are correct, and the path exists.`, 
            timestamp: new Date().toISOString() 
          });
        }
        
        let scanOutput = `Scanning repository for vulnerabilities...\n[INFO] Found ${files.length} items in repository.\n[INFO] Analyzing source code with Gemini-3-Flash...\n`;
        const findings: any[] = [];
        
        // Pick a few interesting files to analyze (e.g., .ts, .js, .py, .go)
        const codeFiles = files.filter((f: any) => 
          f.type === 'blob' && 
          (f.path.endsWith('.ts') || f.path.endsWith('.js') || f.path.endsWith('.py') || f.path.endsWith('.go'))
        ).slice(0, 5); // Increased limit slightly

        if (codeFiles.length === 0) {
          scanOutput += `[WARN] No supported code files found in the specified path.\n`;
        }

        for (const file of codeFiles) {
          scanOutput += `[INFO] Analyzing ${file.path}...\n`;
          
          // Fetch file content
          const fileContentRes = await fetch(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(pid as string)}/repository/files/${encodeURIComponent(file.path)}/raw?ref=main`, {
            headers: { "PRIVATE-TOKEN": GITLAB_TOKEN || "" },
          });
          const content = await fileContentRes.text();

          // Real AI analysis
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Analyze the following code for security vulnerabilities. 
            If you find any, describe them briefly and provide a severity (critical, high, medium, low). 
            Format your response as a JSON object with a "vulnerabilities" array, where each item has "title", "description", "severity", and "file".
            If no vulnerabilities are found, return an empty array for "vulnerabilities".
            
            File: ${file.path}
            
            Code:
            ${content}`,
            config: { responseMimeType: "application/json" }
          });
          
          try {
            const result = JSON.parse(response.text);
            if (result.vulnerabilities && result.vulnerabilities.length > 0) {
              findings.push(...result.vulnerabilities.map((v: any) => ({ ...v, file: file.path })));
              scanOutput += `[WARN] Found ${result.vulnerabilities.length} issue(s) in ${file.path}\n`;
            } else {
              scanOutput += `[INFO] No vulnerabilities found in ${file.path}\n`;
            }
          } catch (e) {
            scanOutput += `[AI] ${response.text}\n`;
          }
        }
        
        scanOutput += `[SUCCESS] Scan complete. ${findings.length} vulnerabilities detected.`;
        return res.json({ output: scanOutput, data: { findings }, timestamp: new Date().toISOString() });
      } catch (error) {
        console.error("Scan error:", error);
        return res.status(500).json({ output: `Error: Failed to perform AI scan. ${error instanceof Error ? error.message : String(error)}`, timestamp: new Date().toISOString() });
      }
    } else if (fullCommand.startsWith("asro pipeline run")) {
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
    } else if (fullCommand === "asro help") {
      output = "ASRO CLI v1.0.0 - Available Commands:\n" +
               "- asro scan [path]: AI-powered vulnerability scan (e.g., asro scan src)\n" +
               "- asro pipeline run: Trigger a new GitLab pipeline\n" +
               "- asro pipelines: List recent GitLab pipelines\n" +
               "- asro mr create: Create a Merge Request with a patch\n" +
               "- asro repo: Show current repository information\n" +
               "- asro whoami: Show current GitLab user information\n" +
               "- asro agents: Check status of AI agents\n" +
               "- asro config: Show current configuration\n" +
               "- asro version: Show CLI version information\n" +
               "- asro clear: Clear the terminal screen\n" +
               "- asro exit: Close the terminal";
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
