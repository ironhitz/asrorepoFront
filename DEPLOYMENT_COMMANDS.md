# ASRO Frontend - Deployment Quick Reference

Quick command reference for deploying and managing ASRO frontend.

---

## Table of Contents

- [Installation](#installation)
- [Local Development](#local-development)
- [Building](#building)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/asrorepo-frontend
cd asrorepo-frontend

# Install dependencies
npm install

# Install gh-pages for deployment
npm install --save-dev gh-pages

# Create .env.local from template
cp .env.example .env.local

# Edit .env.local with your credentials
nano .env.local
```

---

## Local Development

```bash
# Start development server (http://localhost:5173)
npm run dev

# Run linter
npm run lint

# Preview production build
npm run preview

# Build analysis
npm run analyze
```

---

## Building

```bash
# Build for production
npm run build

# Check build size
du -sh dist/

# List build artifacts
ls -lh dist/
```

---

## Deployment

### Option 1: Manual Deployment (gh-pages)

```bash
# Build and deploy in one command
npm run deploy

# Or manually:
npm run build
gh-pages -d dist
```

### Option 2: GitHub Pages with GitHub Actions

```bash
# Just push to main branch
git add .
git commit -m "chore: deployment update"
git push origin main

# Monitor at: GitHub → Actions tab
```

### Option 3: Custom Domain

```bash
# 1. Add CNAME to public folder
echo "yourdomain.com" > public/CNAME

# 2. Point DNS to GitHub Pages:
#    A records:
#    185.199.108.153
#    185.199.109.153
#    185.199.110.153
#    185.199.111.153

# 3. Deploy
npm run deploy
```

---

## GitHub Secrets Setup

```bash
# Using GitHub CLI:
gh secret set GITLAB_API_URL -b "https://gitlab.com/api/v4"
gh secret set GITLAB_TOKEN -b "glpat-xxxxx"
gh secret set GITLAB_PROJECT_ID -b "79598942"
gh secret set SLACK_WEBHOOK -b "https://hooks.slack.com/..."

# List secrets
gh secret list
```

---

## Monitoring

### Check Deployment Status

```bash
# View GitHub Actions status
# https://github.com/YOUR_USERNAME/asrorepo-frontend/actions

# View deployment history
git log --oneline

# Check site health
curl -I https://YOUR_USERNAME.github.io/asrorepo-frontend

# Check response time
curl -w "@curl-format.txt" -o /dev/null -s https://YOUR_USERNAME.github.io/asrorepo-frontend
```

### Performance Metrics

```bash
# Google Lighthouse
# Open DevTools → Lighthouse → Analyze

# Check Core Web Vitals
# Open https://YOUR_USERNAME.github.io/asrorepo-frontend
# Press F12 → Console
# Web Vitals will be logged
```

---

## Troubleshooting

### Build Failures

```bash
# Clear cache and retry
rm -rf node_modules dist
npm ci
npm run build

# Check for errors
npm run lint

# Check Node version
node --version  # Should be 18+
```

### Deployment Issues

```bash
# Check if gh-pages is installed
npm list gh-pages

# Force redeploy
gh-pages -d dist --force

# Check branch exists
git branch -a

# Verify gh-pages branch
git log -n 1 --all -- gh-pages
```

### GitLab Integration Issues

```bash
# Test GitLab API connection
curl -H "Private-Token: YOUR_TOKEN" \
  https://gitlab.com/api/v4/projects/79598942

# Verify token scopes
curl -H "Private-Token: YOUR_TOKEN" \
  https://gitlab.com/api/v4/user
```

### 404 Errors After Deployment

```bash
# Check vite.config.ts base path
grep "base:" vite.config.ts

# Should match repository name:
# base: '/asrorepo-frontend/'

# Clear browser cache (Ctrl+Shift+Delete)
# Then reload page
```

### Environment Variables Not Loading

```bash
# Verify VITE_ prefix
grep VITE_ .env.local

# All variables must start with VITE_
# ✅ VITE_GITLAB_TOKEN
# ❌ GITLAB_TOKEN
```

---

## Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy

# Check code quality
npm run lint

# Preview build locally
npm run preview

# Security audit
npm audit

# Update dependencies
npm update

# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## GitHub Actions Status Codes

| Status | Meaning |
|--------|---------|
| ✅ | Success - Deployment completed |
| ❌ | Failed - Check logs for errors |
| ⏳ | In Progress - Wait for completion |
| ⚠️ | Warning - Check workflow logs |

---

## Useful Links

| Resource | URL |
|----------|-----|
| GitHub Pages | https://pages.github.com/ |
| Vite Docs | https://vitejs.dev/ |
| React Docs | https://react.dev/ |
| GitLab API | https://docs.gitlab.com/ee/api/ |
| GitHub CLI | https://cli.github.com/ |

---

## Environment Variables Reference

```env
# Required for GitLab integration
VITE_GITLAB_API_URL=https://gitlab.com/api/v4
VITE_GITLAB_TOKEN=glpat-xxxxx        # Get from: Settings → Access Tokens
VITE_GITLAB_PROJECT_ID=79598942

# Optional - Auto refresh
VITE_AUTO_REFRESH_ENABLED=true        # Enable auto-refresh
VITE_REFRESH_INTERVAL=30000           # Refresh every 30 seconds

# Optional - Monitoring
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

---

## Rollback to Previous Version

```bash
# See all commits
git log --oneline -10

# Revert to specific commit
git revert <commit-hash>

# Push changes
git push origin main

# GitHub Pages rebuilds automatically
```

---

## Performance Optimization

```bash
# Analyze bundle size
npm run analyze

# Check bundle cost
npm installed size

# Track lighthouse score
# Open DevTools → Lighthouse
# Target: 90+ performance score
```

---

## Questions?

- Check [DEPLOYMENT_ADVANCED.md](DEPLOYMENT_ADVANCED.md)
- Check [DEPLOYMENT_CHECKLIST_ADVANCED.md](DEPLOYMENT_CHECKLIST_ADVANCED.md)
- View GitHub Issues
- Contact: support@asrorepo.dev

---

Last Updated: March 2026  
Status: ✅ Production Ready
