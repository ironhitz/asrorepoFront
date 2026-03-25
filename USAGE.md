# ASRO CLI - Usage Guide

<p align="center">
  <img src="https://gitlab.com/uploads/-/system/project/avatar/1234567/asro-logo.png" width="200" alt="ASRO Logo"/>
</p>

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Command Reference](#command-reference)
5. [Plugin System](#plugin-system)
6. [AI Features](#ai-features)
7. [Configuration](#configuration)
8. [API Usage](#api-usage)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

ASRO (Autonomous Security & Release Orchestrator) is a unified CLI system that combines GitLab integration, AI-powered security scanning, and extensible plugin architecture. It works identically in:

- **Local Development** - VS Code terminal
- **Browser Terminal** - React frontend embedded terminal
- **API Mode** - Server-side execution

### Key Features

- 🤖 **AI-Powered Scanning** - Vulnerability detection using Gemini AI
- 🔄 **Pipeline Automation** - GitLab CI/CD integration
- 🔌 **Plugin System** - Extend functionality with custom plugins
- 🎯 **Multi-Tenant** - Isolated environments for different teams
- 🔐 **Security First** - Verified plugins via GitLab security scans

---

## Installation

### Prerequisites

```bash
# Required
- Node.js 18+
- Git
- GitLab Account

# Optional
- Gemini API Key (for AI features)
```

### Environment Setup

```bash
# Clone the repository
git clone https://github.com/ironhitz/asrorepoFront.git
cd asrorepoFront

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# GitLab Configuration
GITLAB_TOKEN=your_gitlab_personal_access_token
GITLAB_PROJECT_ID=your_project_id
GITLAB_BASE_URL=https://gitlab.com/api/v4

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# Server Configuration
PORT=3000
NODE_ENV=development
```

> **Note:** Generate GitLab tokens at: `GitLab > Settings > Access Tokens` with `api` scope.

---

## Quick Start

### 1. Start the Development Server

```bash
npm run dev
```

This starts both the frontend and backend API server.

### 2. Open the Browser Interface

Navigate to `http://localhost:5173` to access the ASRO dashboard.

### 3. Use the Terminal

Click the terminal icon in the bottom-right corner to open the embedded CLI:

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ██████╗ ███████╗███████╗██╗     ██╗███╗   ██╗███████╗                ║
║ ██╔═══██╗██╔════╝██╔════╝██║     ██║████╗  ██║██╔═══╝                 ║
║ ██║   ██║█████╗  █████╗  ██║     ██║██╔██╗ ██║█████╗                  ║
║ ██║   ██║██╔══╝  ██╔══╝  ██║     ██║██║╚██╗██║██╔══╝                  ║
║ ╚██████╔╝██║     ██║     ███████╗██║██║ ╚████║███████╗                ║
║  ╚═════╝ ╚═╝     ╚═╝     ╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝                ║
║                                                                          ║
║OFFLINE ASRO CLI - Autonomous Secure Release Orchestrator                ║
║ NB* Still under development- Contributors welcome!                     ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### 4. Run Your First Command

```bash
asro help
```

---

## Command Reference

### Core Commands

| Command | Description | Example |
|---------|-------------|---------|
| `help` | Show available commands | `asro help` |
| `version` | Show CLI version | `asro version` |
| `config` | Display configuration | `asro config` |
| `doctor` | Health check | `asro doctor` |

### Git Commands

| Command | Description | Example |
|---------|-------------|---------|
| `commit` | AI-enhanced commit | `asro commit Fixed bug` |
| `push` | Push and trigger pipeline | `asro push` |

### Security Commands

| Command | Description | Example |
|---------|-------------|---------|
| `scan` | Vulnerability scan | `asro scan src/` |
| `patch` | Generate security patch | `asro patch XSS vulnerability` |

### Pipeline Commands

| Command | Description | Example |
|---------|-------------|---------|
| `pipeline run` | Trigger pipeline | `asro pipeline run` |
| `pipeline` | List pipelines | `asro pipeline` |

### Plugin Commands

| Command | Description | Example |
|---------|-------------|---------|
| `plugin list` | List plugins | `asro plugin list` |
| `plugin install` | Install plugin | `asro plugin install security-tools https://github.com/user/plugin` |
| `plugin uninstall` | Remove plugin | `asro plugin uninstall security-tools` |
| `plugin verify` | Verify plugin | `asro plugin verify security-tools` |

### AI Commands

| Command | Description | Example |
|---------|-------------|---------|
| `agents` | List AI agents | `asro agents` |
| `agents run` | Run agent | `asro agents run scanner` |
| `generate plugin` | AI generate plugin | `asro generate plugin audit tool` |

### Information Commands

| Command | Description | Example |
|---------|-------------|---------|
| `whoami` | Current user info | `asro whoami` |
| `repo` | Repository info | `asro repo` |

---

## Detailed Command Documentation

### 🔍 asro scan

Scans the repository for security vulnerabilities using AI analysis.

```bash
asro scan [path]
```

**Options:**
- `path` - Specific directory or file to scan (optional)

**Example Output:**
```
Scanning repository for vulnerabilities...
[INFO] Found 45 items.
[INFO] Analyzing with AI...
[INFO] Analyzing src/index.ts...
[WARN] Found 2 issue(s)
[INFO] Analyzing src/utils/auth.ts...
[INFO] No vulnerabilities found
[SUCCESS] Scan complete. 2 vulnerabilities detected.
```

**Screenshot:**

### 📦 asro commit

Creates an AI-enhanced git commit with automatically generated commit messages.

```bash
asro commit [message]
```

**Options:**
- `message` - Commit message (optional, auto-generated if not provided)

**Example:**
```bash
asro commit
# Output: [SUCCESS] Changes committed.
# Message: Add user authentication flow with OAuth2
```

### 🚀 asro push

Pushes changes to remote and triggers a GitLab pipeline.

```bash
asro push [branch]
```

**Options:**
- `branch` - Branch to push to (default: main)

**Example Output:**
```
[SUCCESS] Pipeline triggered.
Pipeline ID: 1234567
Status: pending
URL: https://gitlab.com/org/project/-/pipelines/1234567
```

### 🔧 asro patch

Generates a security patch for a specific vulnerability.

```bash
asro patch <vulnerability-description>
```

**Example:**
```bash
asro patch SQL injection in user input
```

**Example Output:**
```
[SUCCESS] Security patch branch created: security-patch-1699999999
Description: Fixed SQL injection vulnerability

Patch:
--- a/src/db/query.js
+++ b/src/db/query.js
@@ -15,7 +15,7 @@
-  const query = `SELECT * FROM users WHERE id = ${userId}`;
+  const query = `SELECT * FROM users WHERE id = $1`;
```

---

## Plugin System

### Overview

ASRO's plugin system allows you to extend functionality with custom commands. Plugins are stored in `.asro/plugins/` and support multi-tenancy.

### Installing a Plugin

```bash
asro plugin install my-plugin https://github.com/username/my-plugin
```

**Screenshot:** _[Plugin install demonstration]_

### Creating a Plugin

Plugins are JavaScript modules that export commands:

```javascript
// my-plugin/index.js
export default {
  name: "my-plugin",
  version: "1.0.0",
  commands: {
    hello: async (context, args) => {
      return { 
        success: true, 
        output: "Hello from my plugin!" 
      };
    },
    greet: async (context, args) => {
      const name = args[0] || "User";
      return { 
        success: true, 
        output: `Hello, ${name}!` 
      };
    }
  }
};
```

### Plugin Commands

```bash
# List installed plugins
asro plugin list

# Verify plugin security
asro plugin verify my-plugin

# Uninstall plugin
asro plugin uninstall my-plugin
```

---

## AI Features

### AI-Powered Plugin Generation

Generate new plugins using AI:

```bash
asro generate plugin security audit scanner
```

**Example Output:**
```
[SUCCESS] Plugin "security-audit-scanner" created at /path/to/.asro/plugins/security-audit-scanner

Use: asro security-audit-scanner scan
```

### AI Agents

ASRO includes built-in AI agents:

```bash
# List available agents
asro agents

# Output:
Active AI Agents:
- Gemini-3-Flash (Scanner): Online
- Gemini-Pro (Patch Generator): Online
- ASRO-Orchestrator (Coordinator): Online
```

---

## Configuration

### Display Current Config

```bash
asro config
```

**Example Output:**
```
Configuration:
- GITLAB_BASE_URL: https://gitlab.com/api/v4
- GITLAB_PROJECT_ID: 12345678
- AI_MODEL: gemini-3-flash-preview
- SCAN_DEPTH: deep
- TENANT_ID: default
```

### Environment Configuration

| Variable | Description | Required |
|----------|-------------|-----------|
| `GITLAB_TOKEN` | GitLab Personal Access Token | Yes |
| `GITLAB_PROJECT_ID` | Default project ID | Yes |
| `GITLAB_BASE_URL` | GitLab API URL | No |
| `GEMINI_API_KEY` | Google Gemini API key | No |
| `TENANT_ID` | Multi-tenant identifier | No |

---

## API Usage

### Execute Command Endpoint

```http
POST /api/cli/execute
Content-Type: application/json

{
  "command": "scan",
  "args": ["src/"],
  "projectId": "12345678",
  "tenantId": "my-team"
}
```

### Response Format

```json
{
  "success": true,
  "output": "Scanning repository...",
  "data": {
    "findings": [
      {
        "title": "XSS Vulnerability",
        "severity": "high",
        "file": "src/components/Input.tsx"
      }
    ]
  },
  "timestamp": "2026-03-25T06:50:00Z"
}
```

### Projects Endpoint

```http
GET /api/projects
```

---

## Troubleshooting

### Common Issues

#### 1. "GitLab configuration missing"

**Solution:** Set `GITLAB_TOKEN` environment variable.

```bash
export GITLAB_TOKEN=your_token
```

#### 2. "AI client not configured"

**Solution:** Set `GEMINI_API_KEY` environment variable.

#### 3. Plugin not loading

**Solution:** 
1. Check plugin exists in `.asro/plugins/`
2. Verify plugin has valid `index.js`
3. Run `asro plugin list` to see installed plugins

### Health Check

```bash
asro doctor
```

**Example Output:**
```
ASRO Doctor - Repository Health Check
[OK] GitLab project accessible: my-org/my-project
[OK] Git repository accessible

[SUCCESS] No issues detected.
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ASRO CLI                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Local    │  │  Browser   │  │    API     │             │
│  │   Node.js  │  │  Terminal  │  │   Server   │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                    │
│         └────────────────┼────────────────┘                    │
│                          ▼                                     │
│               ┌─────────────────────┐                          │
│               │   Core Engine      │                          │
│               │ executeCommand()   │                          │
│               └──────────┬──────────┘                          │
│                          │                                     │
│  ┌───────────────────────┼───────────────────────┐             │
│  │                       ▼                       │             │
│  │  ┌─────────┐ ┌──────┐ ┌──────┐ ┌─────────┐  │             │
│  │  │ GitLab  │ │ Git  │ │  AI  │ │Plugins  │  │             │
│  │  │ Client  │ │Adapter│ │Client│ │ Loader  │  │             │
│  │  └────┬────┘ └──────┘ └──────┘ └────┬────┘  │             │
│  └───────┼───────────────────────────────┼────────┘             │
│          ▼                               ▼                      │
│  ┌──────────────────┐      ┌──────────────────┐                 │
│  │  GitLab API     │      │ Local Files    │                 │
│  │  (Pipelines,    │      │ (.asro/plugins)│                 │
│  │   Vulnerabilities│      │                 │                 │
│  └──────────────────┘      └──────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

---

## License

MIT License - See [LICENSE.md](LICENSE.md)

---

<p align="center">
  <strong>ASRO CLI v1.0.0</strong><br>
  Built with ❤️ for DevSecOps
</p>
