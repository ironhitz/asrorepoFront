# 📖 ASRO Complete Usage Guide

Version: 1.0.0
Last Updated: March 16, 2026

## Quick Start
### 1-Minute Setup
1. Clone repository: `git clone https://gitlab.com/git-lab-AI-hackathon/asrorepo.git`
2. Install dependencies: `npm install`
3. Set up GitLab token: `export GITLAB_TOKEN=glpat-xxxxxxxxxxxx`
4. Run compliance check: `npm run compliance`

## Installation
### Prerequisites
- Node.js v18 or higher
- npm v9 or higher
- GitLab account with repository access
- GitLab token with API access

### Step-by-Step
1. **Clone**: `git clone https://gitlab.com/git-lab-AI-hackathon/asrorepo.git`
2. **Install**: `npm install`
3. **Token**: Create at [GitLab Tokens](https://gitlab.com/-/user_settings/personal_access_tokens) with `api`, `read_api`, `write_repository` scopes.
4. **Environment**:
   - `export GITLAB_TOKEN=glpat-xxxxxxxxxxxx`
   - `export CI_PROJECT_ID=79598942`

## Configuration
### .asro.yml
Configure thresholds, auto-patching, and cleanup rules in `.asro.yml`.

## Usage Instructions
### Basic Commands
- `asro scan`: AI-powered security scan.
- `asro compliance check`: Run compliance audit.
- `asro agents run`: Trigger all AI agents.
- `asro patch auto <vulnId>`: Automatically fix a vulnerability.
- `asro setup verify`: Verify your installation and configuration.

## Troubleshooting
- **Token Error**: Ensure `GITLAB_TOKEN` is set in environment or `.env`.
- **401 Unauthorized**: Check token scopes and expiration.
- **Project Not Found**: Verify `CI_PROJECT_ID` is correct.
