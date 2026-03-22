# Pre-Deployment Checklist for ASRO Frontend

Before deploying the ASRO frontend to GitHub Pages or production, verify all items in this checklist.

---

## Repository Setup

- [ ] Repository is public (required for GitHub Pages free tier)
- [ ] Repository name is correct: `asrorepo-frontend`
- [ ] Main branch protection rules are configured
- [ ] Branch is clean with all changes committed
- [ ] No uncommitted changes: `git status` shows clean working tree

---

## Environment Variables

- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.local` is NOT committed to repository
- [ ] All required environment variables are set in `.env.local`:
  - [ ] `VITE_GITLAB_API_URL`
  - [ ] `VITE_GITLAB_TOKEN` (read-only, with correct scopes)
  - [ ] `VITE_GITLAB_PROJECT_ID`
  - [ ] `VITE_AUTO_REFRESH_ENABLED`
  - [ ] `VITE_REFRESH_INTERVAL`
- [ ] GitHub Secrets are configured:
  - [ ] `GITLAB_API_URL`
  - [ ] `GITLAB_TOKEN`
  - [ ] `GITLAB_PROJECT_ID`
  - [ ] `SLACK_WEBHOOK` (optional)

---

## Code Quality

- [ ] All tests pass: `npm run lint`
- [ ] No TypeScript errors: `npm run lint` returns clean
- [ ] Build succeeds: `npm run build` completes without errors
- [ ] Build artifacts exist: `dist/` folder is created
- [ ] No security vulnerabilities: `npm audit` passes
- [ ] Code follows project standards

---

## Build Optimization

- [ ] Bundle size is acceptable: `du -sh dist/` < 500KB
- [ ] No console errors in production build
- [ ] Tree shaking is working correctly
- [ ] Code splitting is implemented
- [ ] Source maps are disabled in production

---

## Configuration Files

- [ ] `vite.config.ts` has correct `base` path: `/asrorepo-frontend/`
- [ ] `package.json` has `deploy` script configured
- [ ] `package.json` has `homepage` field set
- [ ] `.github/workflows/deploy.yml` exists and is valid
- [ ] `.github/workflows/test.yml` exists and is valid
- [ ] `CNAME` file is in `public/` directory (if using custom domain)

---

## GitHub Pages Settings

- [ ] GitHub Pages is enabled in repository settings
- [ ] Source is set to: `Deploy from a branch`
- [ ] Branch is set to: `gh-pages`
- [ ] HTTPS is enabled (automatic for github.io domains)
- [ ] Custom domain is configured (if applicable):
  - [ ] DNS records are pointing to GitHub Pages
  - [ ] CNAME file exists and is committed
  - [ ] Custom domain shows in GitHub Pages settings

---

## GitLab Configuration

- [ ] GitLab token has correct scopes:
  - [ ] `api` - Full API access
  - [ ] `read_repository` - Read repository data
- [ ] Token is read-only (no write permissions)
- [ ] Token expiration date is in the future
- [ ] Project ID is correct: `79598942`
- [ ] GitLab API URL is correct: `https://gitlab.com/api/v4`

---

## Security

- [ ] No API keys or tokens in source code
- [ ] No sensitive data in commits
- [ ] HTTPS is enforced (automatic for GitHub Pages)
- [ ] Security headers are configured (if applicable)
- [ ] CSP headers are set
- [ ] XSS protection is enabled
- [ ] CORS headers are validated
- [ ] No console logs in production
- [ ] Source maps disabled in production

---

## Pre-Deployment Verification

```bash
# Run all checks
npm run lint
npm run build
du -sh dist/

# Verify build artifacts
ls -lh dist/
```

---

## Deployment Steps

### Manual Deployment (Local)

```bash
# 1. Ensure everything is committed
git status

# 2. Run pre-deployment checks
npm run lint
npm run build

# 3. Deploy to GitHub Pages
npm run deploy

# 4. Verify deployment
# Check GitHub Actions tab for success
# Visit: https://YOUR_USERNAME.github.io/asrorepo-frontend
```

### Automated Deployment (GitHub Actions)

```bash
# 1. Ensure everything is committed
git status

# 2. Push to main branch
git push origin main

# 3. Monitor GitHub Actions
# Go to: Repository → Actions tab
# Wait for deploy workflow to complete

# 4. Verify deployment
# Visit: https://YOUR_USERNAME.github.io/asrorepo-frontend
```

---

## Post-Deployment Verification

- [ ] Website is accessible at deployment URL
- [ ] All pages load without errors
- [ ] Dashboard data loads correctly
- [ ] GitLab integration is working
- [ ] Security Dashboard displays data
- [ ] Compliance Dashboard displays data
- [ ] Analytics Dashboard displays data
- [ ] Navigation works correctly
- [ ] Footer and donation link visible
- [ ] About page accessible
- [ ] No 404 errors
- [ ] No CORS errors in console
- [ ] Performance metrics are acceptable
- [ ] Mobile view is responsive

---

## Monitoring After Deployment

- [ ] GitHub Actions shows successful deployment
- [ ] No error alerts in Sentry (if configured)
- [ ] Slack notifications received (if configured)
- [ ] Browser console has no errors
- [ ] Network requests to GitLab API are successful
- [ ] Performance is acceptable

---

## Troubleshooting

If deployment fails, check:

1. **Build errors?**
   ```bash
   rm -rf node_modules dist
   npm ci
   npm run build
   ```

2. **Environment variables not loading?**
   - Ensure variables start with `VITE_`
   - Verify in GitHub Secrets (Settings → Secrets → Actions)
   - Check GitHub Actions logs

3. **404 errors after deployment?**
   - Verify `base` in `vite.config.ts`
   - Check repository name matches config
   - Clear browser cache

4. **CORS errors?**
   - Verify GitLab token has correct scopes
   - Check CORS configuration
   - Ensure API URL is correct

5. **Slow performance?**
   - Check bundle size
   - Review network tab for large files
   - Optimize images and assets

---

## Rollback Procedure

If you need to revert to a previous version:

```bash
# View commit history
git log --oneline

# Revert to specific commit
git revert <commit-hash>

# Push changes
git push origin main

# GitHub Pages will rebuild automatically
```

---

## Final Approval Checklist

- [ ] All checklist items verified
- [ ] Code review completed
- [ ] Security review completed
- [ ] Performance review completed
- [ ] Stakeholder approval received
- [ ] Ready for production deployment

---

**Deployed by:** _______________  
**Date:** _______________  
**Version:** _______________  
**Notes:** _______________

---

For more information, see [DEPLOYMENT_ADVANCED.md](DEPLOYMENT_ADVANCED.md)

Last Updated: March 2026
