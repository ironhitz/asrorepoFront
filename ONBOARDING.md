# 🚀 Developer Onboarding Guide

Welcome to the ASRO Frontend team! This guide will get you up and running in 30 minutes.

---

## 📋 Prerequisite Knowledge

- **React 19**: Component-based architecture, hooks, state management
- **TypeScript**: Type safety, interfaces, generics
- **Tailwind CSS**: Utility-first CSS framework
- **GitLab CI/CD**: Basic understanding of pipelines
- **Git**: Branching, commits, pull requests

---

## ✅ Step 1: Environment Setup (5 minutes)

### 1a. Install Prerequisites

```bash
# Node.js 18+ (verify with: node --version)
# npm 9+ (verify with: npm --version)
# Git (verify with: git --version)
```

**macOS:**
```bash
brew install node@18 git
```

**Windows (WSL2 recommended):**
```powershell
# Install NVM or use official installer
# https://nodejs.org/
```

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs
```

### 1b. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/asrorepo-frontend.git
cd asrorepo-frontend
npm install
```

### 1c. Setup Environment Variables

```bash
cp .env.example .env.local

# Edit .env.local with your values:
# VITE_GITLAB_API_URL=https://gitlab.com/api/v4
# VITE_GITLAB_TOKEN=<your-read-only-token>
# VITE_GITLAB_PROJECT_ID=79598942
```

**Get GitLab Token:**
1. Go to: https://gitlab.com/-/user_settings/personal_access_tokens
2. Create token with scopes: `api` + `read_repository`
3. Copy and paste into `.env.local`

---

## 🎯 Step 2: First Run (5 minutes)

```bash
# Start development server
npm run dev

# Open browser:
# http://localhost:5173

# You should see:
# ✅ ASRO Dashboard with 3 pages
# ✅ GitLab data loading
# ✅ Security metrics displayed
```

**Troubleshooting:**

| Issue | Fix |
|-------|-----|
| Port 5173 already in use | `npm run dev -- --port 5174` |
| Data not loading | Check `.env.local` has correct token |
| TypeScript errors | `npm run lint` to see all issues |
| Build fails | Delete `node_modules` and `npm install` |

---

## 📁 Step 3: Understand the Codebase (10 minutes)

### Project Structure

```
src/
├── components/              # React components
│   ├── ui/                 # Reusable UI (ScoreCard, Badge, etc)
│   ├── Layout.tsx          # Main layout with sidebar
│   ├── ErrorBoundary.tsx   # Error handling
│   └── PageRenderer.tsx    # Route mapping
├── pages/                  # Full page components
│   ├── SecurityDashboard.tsx
│   ├── Compliance.tsx
│   └── Analytics.tsx
├── hooks/                  # Custom React hooks
│   └── useGitLabData.ts   # Data fetching
├── services/               # API clients & utilities
│   ├── gitlabDataService.ts
│   └── aiOrchestration.ts
├── utils/                  # Helper functions
│   ├── metricCalculations.ts
│   ├── animations.ts
│   └── gitlabProjectParser.ts
├── App.tsx                 # Root component
├── main.tsx               # Entry point
└── index.css              # Global styles
```

### Key Files to Know

| File | Purpose | Modify When |
|------|---------|------------|
| `src/App.tsx` | Global state & routing | Adding new pages |
| `src/components/Sidebar.tsx` | Main navigation | Adding menu items |
| `src/services/gitlabDataService.ts` | GitLab API calls | Changing data sources |
| `src/utils/metricCalculations.ts` | Data transforms | Modifying calculations |
| `vite.config.ts` | Build configuration | Changing build behavior |
| `tailwind.config.js` | Theme & styles | Customizing colors |

---

## 🔧 Step 4: CLI Commands Guide (5 minutes)

```bash
# Interactive setup (recommended for first-time)
npm run cli setup

# Watch mode (auto-reload on file changes)
npm run cli watch

# Fix linting issues automatically
npm run cli lint:fix

# Generate component documentation
npm run cli docs:generate
npm run cli docs:serve

# Sync frontend features to GitLab wiki
npm run cli wiki:sync

# Analyze bundle size
npm run cli analyze

# Database operations
npm run cli db:seed
npm run cli db:migrate
npm run cli data:export
```

**Full CLI Usage:**
```bash
npm run cli --help           # Show all available commands
npm run cli COMMAND --help   # Help for specific command
```

---

## 💡 Step 5: Common Tasks

### Add a New Dashboard Page

1. **Create component** in `src/pages/MyPage.tsx`:

```typescript
import React from 'react';
import { motion } from 'motion/react';
import { fadeInUp } from '../utils/animations';

export function MyPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="space-y-6 p-6"
    >
      <h1 className="text-3xl font-bold">My Page</h1>
      {/* Your content here */}
    </motion.div>
  );
}
```

2. **Add to navigation** in `src/components/Sidebar.tsx`:

```typescript
{
  name: 'My Page',
  tab: 'my-page',
  icon: <MyIcon size={20} />
}
```

3. **Add route** in `src/components/PageRenderer.tsx`:

```typescript
case 'my-page':
  return <MyPage />;
```

### Modify the Dashboard Styling

```bash
# Edit Tailwind config
nano tailwind.config.js

# Or use custom CSS in index.css
# Restart dev server to see changes
```

### Fetch Data from GitLab

```typescript
import { useGitLabDashboardData } from '../hooks/useGitLabData';

export function MyComponent() {
  const { latestScan, loading, error } = useGitLabDashboardData();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <div>
      <p>Score: {latestScan.score}</p>
    </div>
  );
}
```

---

## 📚 Step 6: Learn More

- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vite**: https://vitejs.dev/guide/
- **Motion**: https://motion.dev/docs

---

## 🤝 Step 7: Contributing

Before you start contributing:

1. **Read** [CONTRIBUTING.md](CONTRIBUTING.md)
2. **Review** [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
3. **Follow** [SECURITY.md](SECURITY.md) for security best practices

---

## 📞 Getting Help

- **Stuck on setup?** Check [Troubleshooting](#troubleshooting-1) section
- **Questions about code?** Create a GitHub Discussion
- **Found a bug?** Create a GitHub Issue with reproduction steps
- **Security concern?** See [SECURITY.md](SECURITY.md)

---

## ✨ Quick Checklist

- [ ] Node.js 18+ installed
- [ ] Repository cloned
- [ ] `npm install` completed
- [ ] `.env.local` configured with GitLab token
- [ ] `npm run dev` working
- [ ] Dashboard loads with data
- [ ] TypeScript errors resolved
- [ ] You've read [CONTRIBUTING.md](CONTRIBUTING.md)

**You're all set!** 🎉 Start making an impact today!

---

**Last Updated:** March 22, 2026
