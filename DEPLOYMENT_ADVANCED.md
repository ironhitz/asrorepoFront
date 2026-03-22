# ASRO Frontend - Deployment Guide

Complete guide for deploying the ASRO frontend to production environments.

## Table of Contents

- [GitHub Pages Deployment](#github-pages-deployment)
- [Environment Setup](#environment-setup)
- [Build Optimization](#build-optimization)
- [CI/CD Integration](#cicd-integration)
- [Custom Domain](#custom-domain)
- [Monitoring & Logging](#monitoring--logging)
- [Security Checklist](#security-checklist)
- [Troubleshooting](#troubleshooting)

---

## GitHub Pages Deployment

### Prerequisites

- GitHub repository with GitHub Pages enabled
- Node.js 18+ installed locally
- gh-pages package installed

### Step 1: Install gh-pages

```bash
npm install --save-dev gh-pages
```

### Step 2: Update package.json

Add deployment scripts:

```json
{
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist",
    "predeploy": "npm run build"
  },
  "homepage": "https://YOUR_USERNAME.github.io/asrorepo-frontend"
}
```

### Step 3: Configure vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/asrorepo-frontend/', // Match repository name
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
```

### Step 4: Deploy

```bash
# Build and deploy in one command
npm run deploy

# Or manually:
npm run build
gh-pages -d dist
```

### Step 5: Enable GitHub Pages

1. Go to Repository Settings
2. Navigate to "Pages" tab
3. Select `gh-pages` branch
4. Click "Save"
5. Site will be available at `https://YOUR_USERNAME.github.io/asrorepo-frontend`

---

## Environment Setup

### Development Environment

Create `.env.local` (Git ignored - **never commit**):

```env
# GitLab API Configuration
VITE_GITLAB_API_URL=https://gitlab.com/api/v4
VITE_GITLAB_TOKEN=glpat-xxxxxxxxxxxxxxxx
VITE_GITLAB_PROJECT_ID=79598942

# Auto-refresh Settings  
VITE_AUTO_REFRESH_ENABLED=true
VITE_REFRESH_INTERVAL=30000

# Analytics/Monitoring
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### Production Environment (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_GITLAB_API_URL: ${{ secrets.GITLAB_API_URL }}
          VITE_GITLAB_TOKEN: ${{ secrets.GITLAB_TOKEN }}
          VITE_GITLAB_PROJECT_ID: ${{ secrets.GITLAB_PROJECT_ID }}
          VITE_AUTO_REFRESH_ENABLED: true

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist

      - name: Notify Deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'ASRO Frontend deployed to GitHub Pages'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Set GitHub Secrets

1. Go to Settings → Secrets and Variables → Actions
2. Add secrets:

| Secret | Value |
|--------|-------|
| `GITLAB_API_URL` | `https://gitlab.com/api/v4` |
| `GITLAB_TOKEN` | Your GitLab token |
| `GITLAB_PROJECT_ID` | `79598942` |
| `SLACK_WEBHOOK` | (Optional) Slack notification URL |

---

## Build Optimization

### Production Build

```bash
npm run build
```

### Build Analysis

Check bundle size:

```bash
# Install analyzer
npm install --save-dev vite-plugin-visualizer

# Build and analyze
npm run build
```

### Size Optimization Strategies

**Code Splitting**

```typescript
// Dynamic imports for pages
const SecurityDashboard = lazy(() => import('./pages/SecurityDashboard'));
const CompliancePage = lazy(() => import('./pages/Compliance'));
```

**Tree Shaking**

```typescript
// Good - imports only what's needed
import { calculateSecurityScore } from './utils/metricCalculations';

// Bad - imports everything
import * as calculations from './utils/metricCalculations';
```

**CSS Optimization**

```css
/* Remove unused CSS automatically with Tailwind */
@tailwindcss;

/* Purge unused styles in build */
```

---

## CI/CD Integration

### Pre-deployment Checks

```bash
# TypeScript validation
npm run lint

# Build test
npm run build

# Size check
du -sh dist/

# Performance metrics
npm run preview
```

### Automated Testing

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
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
```

---

## Custom Domain

### Point Domain to GitHub Pages

**Option 1: Using nameservers**

In domain registrar, set nameservers:
- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

**Option 2: Using CNAME**

In domain registrar, create CNAME record:
```
asro.example.com → YOUR_USERNAME.github.io
```

**Option 3: Use Apex domain**

In domain registrar, create A records:
```
@ → 185.199.108.153
@ → 185.199.109.153
@ → 185.199.110.153
@ → 185.199.111.153
```

### Configure CNAME in Repository

1. Create `CNAME` file in `public/` folder:
```
asro.example.com
```

2. In GitHub Settings → Pages:
   - Custom domain: `asro.example.com`
   - Enable HTTPS

---

## Monitoring & Logging

### Error Tracking with Sentry

```bash
npm install @sentry/react
```

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});

export default Sentry.withProfiler(App);
```

### Performance Monitoring

```typescript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);  // Cumulative Layout Shift
getFID(console.log);  // First Input Delay
getFCP(console.log);  // First Contentful Paint
getLCP(console.log);  // Largest Contentful Paint
getTTFB(console.log); // Time to First Byte
```

### Browser Console Logging

Configure log levels by environment:

```typescript
const isDev = import.meta.env.DEV;

const log = {
  info: (...args: any[]) => isDev && console.log('[INFO]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
};
```

---

## Security Checklist

- [ ] All secrets stored in GitHub Secrets (never in code)
- [ ] `.env.local` added to `.gitignore`
- [ ] HTTPS enabled on custom domain
- [ ] SecurityHeaders configured
- [ ] CSP headers set up
- [ ] No sensitive data in source maps
- [ ] Dependencies audited: `npm audit`
- [ ] TypeScript strict mode enabled
- [ ] XSS protection implemented
- [ ] CORS headers validated

### Security Headers

Update GitHub Pages with security headers:

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'
```

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm ci
npm run build
```

### 404 Errors After Deployment

**Solution:** Update `base` in `vite.config.ts`:

```typescript
base: '/asrorepo-frontend/' // Matches repo name
```

### Environment Variables Not Loading

**Solution:** Variables must start with `VITE_`:

```
✅ VITE_GITLAB_TOKEN=xxx
❌ GITLAB_TOKEN=xxx  // Won't work
```

### Slow Load Times

- Check bundle size
- Enable gzip compression
- Set `VITE_REFRESH_INTERVAL` higher
- Implement image lazy loading
- Cache API responses

### CORS Errors

**Solution:** Ensure GitLab token has correct scopes:

```
✅ api - Access API
✅ read_repository - Read repository
```

### Deployment Stuck

```bash
# Clean and force redeploy
npm run build
gh-pages -d dist --force
```

---

## Monitoring Deployment

### GitHub Actions Status

- Check Actions tab in GitHub
- View logs for any failures
- Monitor deployment history

### Site Health Check

```bash
# Test if site is up
curl -I https://YOUR_USERNAME.github.io/asrorepo-frontend

# Check response time
curl -w "@curl-format.txt" -o /dev/null -s https://YOUR_USERNAME.github.io/asrorepo-frontend
```

### Performance Insights

- Use Lighthouse in Chrome DevTools
- Target: 90+ performance score
- Check Core Web Vitals

---

## Rollback Procedure

If deployment has issues:

```bash
# View deployment history
git log --oneline

# Revert to previous version
git revert <commit-hash>
git push origin main

# GitHub Pages rebuilds automatically
```

---

## Support & Resources

- [Vite Documentation](https://vitejs.dev/)
- [GitHub Pages Documentation](https://pages.github.com/)
- [GitLab API Documentation](https://docs.gitlab.com/ee/api/)
- [React Documentation](https://react.dev/)

---

**Last Updated:** March 2026  
**Status:** Production Ready ✅

