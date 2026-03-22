# 🚀 Deployment Integration Guide - ASRO Frontend

Complete guide for deploying ASRO frontend to **Vercel** or using **GitHub Actions** for automated deployment.

---

## Table of Contents
1. [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
2. [GitHub Pages with GitHub Actions](#github-pages-with-github-actions)
3. [GitHub Actions CI/CD Pipeline](#github-actions-cicd-pipeline)
4. [Environment Variables Setup](#environment-variables-setup)
5. [Custom Domain Setup](#custom-domain-setup)
6. [Monitoring Deployments](#monitoring-deployments)

---

## Vercel Deployment (Recommended)

Vercel is the fastest and easiest way to deploy Next.js/React apps. **Zero configuration needed!**

### Step 1: Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub" (recommended)
4. Authorize Vercel to access your GitHub account

### Step 2: Import Your Repository

1. In Vercel dashboard, click "Add New..." → "Project"
2. Select "Import Git Repository"
3. Search for `asrorepo-frontend`
4. Click "Import"

### Step 3: Configure Project

The default settings should work, but verify:

```
Framework Preset: Vite ✓
Root Directory: ./
Build Command: npm run build (auto-detected)
Output Directory: dist (auto-detected)
Install Command: npm install (auto-detected)
```

### Step 4: Set Environment Variables

1. After importing, go to **Settings** → **Environment Variables**
2. Add the following variables:

```
VITE_GITLAB_API_URL = https://gitlab.com/api/v4
VITE_GITLAB_TOKEN = glpat-xxxxxxxxxxxxxxxx
VITE_GITLAB_PROJECT_ID = 79598942
VITE_AUTO_REFRESH_ENABLED = true
VITE_REFRESH_INTERVAL = 30000
```

**Important**: Set each variable for all environments:
- ✅ Production
- ✅ Preview
- ✅ Development

3. Click "Save"

### Step 5: Deploy

1. Click "Deploy" button
2. Vercel builds and deploys automatically
3. Your site is live! 🎉

**Site will be available at**: `https://asrorepo-frontend.vercel.app`

### Step 6: Automatic Updates

From now on, every time you push to `main` branch:
```bash
git push origin main
```

✅ Vercel automatically rebuilds and deploys!

### Vercel Benefits

- ✅ **Zero configuration** - Just connect and deploy
- ✅ **Automatic HTTPS** - Built-in SSL
- ✅ **Global CDN** - Fast worldwide
- ✅ **Preview URLs** - For each pull request
- ✅ **Performance analytics** - Built-in monitoring
- ✅ **Unlimited deployments** - Free tier includes 100/month
- ✅ **Rollback with one click** - Previous versions available

---

## GitHub Pages with GitHub Actions

Deploy using GitHub's built-in GitHub Pages service with automated CI/CD.

### Step 1: Enable GitHub Pages

1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. Under "Source", select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click "Save"

### Step 2: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      # 1. Checkout code
      - name: Checkout code
        uses: actions/checkout@v3

      # 2. Setup Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      # 3. Install dependencies
      - name: Install dependencies
        run: npm ci

      # 4. Build
      - name: Build project
        run: npm run build
        env:
          VITE_GITLAB_API_URL: https://gitlab.com/api/v4
          VITE_GITLAB_TOKEN: ${{ secrets.GITLAB_TOKEN }}
          VITE_GITLAB_PROJECT_ID: ${{ secrets.GITLAB_PROJECT_ID }}
          VITE_AUTO_REFRESH_ENABLED: true
          VITE_REFRESH_INTERVAL: 30000

      # 5. Deploy to GitHub Pages
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        if: github.ref == 'refs/heads/main'
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          cname: asrorepo.example.com  # Optional: if using custom domain

      # 6. Notify Slack (Optional)
      - name: Slack Notification
        uses: 8398a7/action-slack@v3
        if: always()
        with:
          status: ${{ job.status }}
          text: 'ASRO Frontend Deployment: ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Step 2A: Set GitHub Secrets

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click "New repository secret"
3. Add these secrets:

| Secret Name | Value |
|------------|-------|
| `GITLAB_TOKEN` | Your GitLab token |
| `GITLAB_PROJECT_ID` | 79598942 |
| `SLACK_WEBHOOK` | (Optional) Slack webhook URL |

### Step 3: Push and Deploy

```bash
git add .github/
git commit -m "ci: add GitHub Pages deployment workflow"
git push origin main
```

✅ GitHub Actions automatically builds and deploys!

### View Deployment Status

1. Go to **Actions** tab in GitHub
2. Click latest workflow run
3. See "Build and Deploy" steps
4. Scroll to "Deploy to GitHub Pages"

**Site will be available at**: `https://USERNAME.github.io/asrorepo-frontend`

---

## GitHub Actions CI/CD Pipeline

Advanced automation with testing, linting, and deployment.

### Complete CI/CD Workflow

Create `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Job 1: Lint and Test
  lint-and-test:
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

      - name: Run linter
        run: npm run lint

      - name: Build test
        run: npm run build

  # Job 2: Build and Deploy (only on main branch)
  deploy:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
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
          VITE_GITLAB_TOKEN: ${{ secrets.GITLAB_TOKEN }}
          VITE_GITLAB_PROJECT_ID: ${{ secrets.GITLAB_PROJECT_ID }}

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist

      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ github.run_number }}
          release_name: Release ${{ github.run_number }}
          body: "Automated deployment from GitHub Actions"

  # Job 3: Performance Check (Optional)
  performance:
    needs: lint-and-test
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

      - name: Check bundle size
        run: |
          SIZE=$(du -sh dist/ | cut -f1)
          echo "Bundle size: $SIZE"
          [[ $(du -s dist/ | awk '{print $1}') -lt 200000 ]] && echo "✅ Size OK" || echo "⚠️ Large bundle"
```

---

## Environment Variables Setup

### For Vercel

**GUI Method:**
1. Dashboard → Project Settings → Environment Variables
2. Add each variable:
   ```
   Name: VITE_GITLAB_TOKEN
   Value: glpat-xxxxxxxxxxxxxxxx
   Environments: Production, Preview, Development
   ```

**Encrypted for all environments:**
```bash
vercel env add VITE_GITLAB_TOKEN
# Follow CLI prompts
```

### For GitHub Actions

**In repository:**
1. Settings → Secrets and variables → Actions
2. Add `GITLAB_TOKEN` and `GITLAB_PROJECT_ID`
3. Reference in workflow: `${{ secrets.GITLAB_TOKEN }}`

**Never commit these:**
```bash
# .gitignore
.env.local
.env.*.local
*.env
```

---

## Custom Domain Setup

### Option 1: Vercel with Custom Domain

1. Go to **Project Settings** → **Domains**
2. Click "Add Domain"
3. Enter your domain (e.g., `asro.example.com`)
4. Choose how to assign:
   - **Nameservers** (recommended) - Point domain registrar to Vercel
   - **CNAME** - Add CNAME record in registrar

5. Vercel provides SSL automatically

### Option 2: GitHub Pages with Custom Domain

1. Create `CNAME` file in `public/` folder:
   ```
   asrorepo.example.com
   ```

2. In domain registrar, create CNAME record:
   ```
   asrorepo → YOUR_USERNAME.github.io
   ```

3. In repository **Settings** → **Pages** → enter domain
4. GitHub automatically enables HTTPS

---

## Continuous Deployment Setup

### Auto-Deploy on Push

**Vercel** (automatic):
```bash
git push origin main
# Vercel deploys automatically
```

**GitHub Pages** (requires workflow):
```bash
git push origin main
# GitHub Actions triggers → deploys to gh-pages branch
```

### Auto-Deploy on Release

Add to workflow to only deploy on release tags:

```yaml
on:
  release:
    types: [published]
```

Then create a release:
```bash
git tag v1.0.0
git push origin v1.0.0
# Or create via GitHub UI
```

### Auto-Deploy on Pull Request (Preview)

**Vercel** (automatic - creates preview URL):
- Every PR automatically gets a unique preview URL
- Share with teammates before merging

**GitHub Pages** (manual preview):
- Build artifacts available in Actions
- Download from workflow run

---

## Monitoring Deployments

### Vercel Analytics

1. Dashboard → Analytics
2. See:
   - Page load times
   - Bandwidth usage
   - Deployment history
   - Edge locations

### GitHub Actions Monitoring

1. **Actions** tab → Select workflow
2. See:
   - Build logs
   - Success/failure
   - Execution time
   - Environment used

### Performance Monitoring

**Lighthouse CI:**

```yaml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v9
  with:
    configPath: './lighthouserc.json'
```

Create `lighthouserc.json`:
```json
{
  "ci": {
    "collect": {
      "url": ["https://your-site.vercel.app"],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended"
    }
  }
}
```

---

## Troubleshooting Deployments

### Vercel Issues

**Build fails:**
```bash
# Check locally first
npm run build

# View build logs in Vercel dashboard
# Click "View Build Logs" on failed deployment
```

**Environment variables not loading:**
- Verify `VITE_` prefix (required for Vite)
- Redeploy after adding secrets
- Check "Environments" are selected

**Site shows 404:**
- Verify output directory: `dist/`
- Check build command: `npm run build`
- Clear Vercel cache: Settings → Deployments → Clear Deployments

### GitHub Pages Issues

**Site not updating:**
```bash
# Force rebuild
git commit --allow-empty -m "trigger rebuild"
git push origin main
```

**Wrong directory deployed:**
- Check action uses `publish_dir: ./dist`
- Verify build outputs to `dist/`

**Custom domain HTTPS not working:**
- Wait 24 hours for DNS propagation
- Verify CNAME record correct
- Check "Enforce HTTPS" checkbox

### GitHub Actions Workflow Issues

**Workflow not triggering:**
1. Check `.github/workflows/` file syntax (YAML)
2. Verify branch name matches (main vs master)
3. Check file is in `main` branch (not local only)

**Secrets not found:**
```yaml
# ❌ Wrong
run: echo $GITLAB_TOKEN

# ✅ Correct
run: echo ${{ secrets.GITLAB_TOKEN }}
```

**Timeout during build:**
- Increase timeout (default 360 minutes)
- Optimize dependencies
- Check for infinite loops in code

---

## Deployment Comparison

| Aspect | Vercel | GitHub Pages |
|--------|--------|--------------|
| **Setup Time** | 2 min | 10 min |
| **Cost** | Free tier available | Free (unlimited) |
| **Custom Domain** | Yes (with CNAME) | Yes (with CNAME) |
| **HTTPS** | Automatic | Automatic |
| **Preview URLs** | Automatic per PR | Manual/GitHub Actions |
| **Performance** | Global CDN | GitHub CDN |
| **Monitoring** | Built-in analytics | Manual setup |
| **Rollback** | Easy (1 click) | Via git revert |
| **Serverless Functions** | Supported | Not supported |

**Recommendation**: Use **Vercel** for easiest setup. Use **GitHub Pages** if you want everything in GitHub.

---

## Step-by-Step: Quick Deploy (5 minutes)

### Using Vercel (Fastest):

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to vercel.com
# 3. Click "Add New Project"
# 4. Select asrorepo-frontend
# 5. Add environment variables (from Settings)
# 6. Click Deploy
# Done! Site live in ~2 minutes 🎉
```

### Using GitHub Actions:

```bash
# 1. Create .github/workflows/deploy.yml (copy from above)
git add .github/

# 2. Set GitHub Secrets
# Settings → Secrets → Add GITLAB_TOKEN, GITLAB_PROJECT_ID

# 3. Push
git commit -m "ci: add deployment workflow"
git push origin main

# 4. Watch Actions tab
# Deployment complete in ~3 minutes 🎉
```

---

## Production Checklist

Before deploying to production:

- [ ] Environment variables set in platform
- [ ] GitLab token has correct scopes (api + read_repository)
- [ ] `npm run build` succeeds locally
- [ ] No TypeScript errors (`npm run lint`)
- [ ] `.env.local` NOT committed (in .gitignore)
- [ ] Custom domain configured (if using)
- [ ] HTTPS enabled (automatic)
- [ ] Monitoring set up (Vercel Analytics or Sentry)

---

## Production Secrets Management

### Best Practices

```
✅ DO:
- Store tokens in platform secrets
- Use read-only tokens
- Rotate tokens quarterly
- Use different tokens per environment

❌ DON'T:
- Commit .env files
- Paste secrets in issues/PRs
- Reuse production tokens dev
- Share secrets via email
```

### Vercel Secrets Rotation

```bash
# Generate new GitLab token
# Go to GitLab → Settings → Access Tokens

# Update in Vercel:
# 1. Go to Settings → Environment Variables
# 2. Edit VITE_GITLAB_TOKEN
# 3. Paste new token
# 4. Save and redeploy
```

---

## Next Steps

1. **Choose platform**: Vercel (easier) or GitHub Pages (more control)
2. **Follow setup steps** above for your choice
3. **Configure environment variables**
4. **Deploy and test**
5. **Monitor performance** (Vercel Analytics or GitHub logs)

---

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Pages Documentation](https://pages.github.com)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

**Last Updated**: March 22, 2026  
**Status**: Production Ready ✅
