# 🚀 Quick Deploy Reference - Copy & Paste Ready

Quick reference with ready-to-use deployment configurations.

---

## ⚡ 30-Second Setup

### Vercel (Easiest)

```bash
# 1. Just push to GitHub
git push origin main

# 2. Go to vercel.com, import repo, add 4 env vars
# Done! 🎉
```

**No files to create. Just sign up and import!**

---

## GitHub Actions Workflow (Copy-Paste)

### File: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
        env:
          VITE_GITLAB_API_URL: https://gitlab.com/api/v4
          VITE_GITLAB_TOKEN: ${{ secrets.GITLAB_TOKEN }}
          VITE_GITLAB_PROJECT_ID: ${{ secrets.GITLAB_PROJECT_ID }}
          VITE_AUTO_REFRESH_ENABLED: true
      
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Step-by-step:

```bash
# 1. Create directory
mkdir -p .github/workflows

# 2. Create file and paste config above
# (Use editor or create file with content)

# 3. Set GitHub secrets
# Go to: Settings → Secrets and variables → Actions
# Add:
#   - GITLAB_TOKEN = glpat-xxxxx
#   - GITLAB_PROJECT_ID = 79598942

# 4. Push
git add .github/
git commit -m "ci: add deployment"
git push origin main

# 5. Watch Actions tab
# Done! 🎉
```

---

## GitHub Actions with CI/CD (Copy-Paste)

### File: `.github/workflows/ci-cd.yml`

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run build
        env:
          VITE_GITLAB_TOKEN: ${{ secrets.GITLAB_TOKEN }}
          VITE_GITLAB_PROJECT_ID: ${{ secrets.GITLAB_PROJECT_ID }}

  deploy:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
        env:
          VITE_GITLAB_TOKEN: ${{ secrets.GITLAB_TOKEN }}
          VITE_GITLAB_PROJECT_ID: ${{ secrets.GITLAB_PROJECT_ID }}
      
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## Environment Variables Template

### For Vercel (via GUI)

```
VITE_GITLAB_API_URL = https://gitlab.com/api/v4
VITE_GITLAB_TOKEN = glpat-xxxxxxxxxxxxxxxx
VITE_GITLAB_PROJECT_ID = 79598942
VITE_AUTO_REFRESH_ENABLED = true
VITE_REFRESH_INTERVAL = 30000
```

### For GitHub Secrets (CLI)

```bash
# Set via GitHub UI or CLI:

gh secret set GITLAB_TOKEN --body "glpat-xxxxxxxxxxxxxxxx"
gh secret set GITLAB_PROJECT_ID --body "79598942"
```

---

## CNAME File (Custom Domain)

### File: `public/CNAME`

```
asrorepo.example.com
```

Replace `asrorepo.example.com` with your actual domain.

---

## Vite Config for GitHub Pages

### File: `vite.config.ts`

If using GitHub Pages with custom domain:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',  // If custom domain
  // OR if using subdirectory:
  // base: '/asrorepo-frontend/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
```

---

## GitHub Pages Settings

### Settings → Pages

```
Source: Deploy from a branch
Branch: gh-pages
Folder: / (root)

✓ Enable HTTPS
✓ Enforce HTTPS
```

If custom domain:
```
Custom domain: asrorepo.example.com
✓ Enforce HTTPS
```

---

## Vercel Deployment Script

### File: `package.json` (Add to scripts)

```json
{
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "tsc --noEmit",
    "deploy:vercel": "vercel",
    "deploy:build": "npm run build && vercel --prod"
  }
}
```

Then deploy with:
```bash
npm run deploy:build
```

---

## Docker Deployment (Bonus)

### File: `Dockerfile`

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### File: `.dockerignore`

```
node_modules
.git
.gitignore
dist
.env.local
```

---

## .gitignore Updates

### Add to `.gitignore`

```
# Environment variables
.env.local
.env.*.local

# Build outputs
dist/
build/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Dependencies
node_modules/
```

---

## GitHub Actions Secrets Setup (Terminal)

```bash
# Using GitHub CLI:

# Set token
gh secret set GITLAB_TOKEN -b "glpat-xxxxx"

# Set project ID
gh secret set GITLAB_PROJECT_ID -b "79598942"

# Add Slack webhook (optional)
gh secret set SLACK_WEBHOOK -b "https://hooks.slack.com/..."

# List all secrets
gh secret list

# Delete a secret
gh secret delete GITLAB_TOKEN
```

---

## Deployment URLs

| Platform | URL |
|----------|-----|
| Vercel | `https://asrorepo-frontend.vercel.app` |
| GitHub Pages | `https://USERNAME.github.io/asrorepo-frontend` |
| Custom Domain | `https://asrorepo.example.com` |

---

## Rollback Procedure

### Vercel: One-Click Rollback

1. Dashboard → Deployments
2. Find previous deployment
3. Click three dots → "Promote to Production"
4. Done! ✅

### GitHub Pages: Using Git

```bash
# See deployment history
git log --oneline

# Revert to previous version
git revert <commit-hash>

# Push (triggers redeployment)
git push origin main
```

---

## Status Badges (For README)

### Vercel Status

```markdown
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?style=flat&logo=vercel)](https://asrorepo-frontend.vercel.app)
```

### GitHub Actions Status

```markdown
[![CI/CD](https://github.com/USERNAME/asrorepo-frontend/actions/workflows/deploy.yml/badge.svg)](https://github.com/USERNAME/asrorepo-frontend/actions)
```

---

## Performance Checks

### Test Build Locally

```bash
npm run build
npm run preview

# Visit http://localhost:4173
```

### Check Bundle Size

```bash
npm run build
du -sh dist/

# Should be < 200KB
```

### Test Environment Variables

```bash
# Create .env.test
VITE_GITLAB_API_URL=https://gitlab.com/api/v4
VITE_GITLAB_TOKEN=test_token
VITE_GITLAB_PROJECT_ID=79598942

# Build with test env
npm run build
```

---

## Monitoring & Alerts

### Sentry Error Tracking

Add to `src/main.tsx`:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### Slack Notifications

Add to workflow:

```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: "Deployment: ${{ job.status }}"
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Troubleshooting Commands

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+

# Verify build works
npm run build

# Check for errors
npm run lint

# Test locally
npm run dev
npm run preview
```

---

## Quick Commands Summary

```bash
# Development
npm run dev           # Start dev server

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Deployment
npm run deploy       # Deploy to Vercel
git push origin main # Deploy to GitHub Pages (if using Actions)

# Verification
npm run lint        # Check TypeScript
npm run build       # Verify build
```

---

## Final Checklist

- [ ] Code pushed to GitHub repo
- [ ] `.env.local` in `.gitignore` (never commit!)
- [ ] GitHub secrets set (GITLAB_TOKEN, GITLAB_PROJECT_ID)
- [ ] Workflow file in `.github/workflows/`
- [ ] `npm run build` works locally
- [ ] `npm run lint` shows no errors
- [ ] Environment variables have `VITE_` prefix
- [ ] Ready to deploy! 🚀

---

**Copy & paste any section above to get started in minutes!**

Last Updated: March 22, 2026
