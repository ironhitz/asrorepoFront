<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ASRO - AI Security Orchestration Frontend

Enterprise-grade security dashboard powered by AI-driven vulnerability scanning and compliance management. Real-time security metrics, threat modeling, and automated remediation tracking.

## 🎯 Features

**Real-Time Security Dashboard**
- Live security score and risk assessment
- Vulnerability distribution by severity
- Critical issue tracking and remediation
- Security trend analysis over time

**Plugin System**
- Plugin marketplace with AI recommendations
- Team-shared plugins with collaboration
- Dependency management and verification
- Install from marketplace or custom repositories

**AI-Powered Features**
- AI-generated security plugins via CLI
- Smart recommendations based on project needs
- Automated vulnerability detection
- Intelligent remediation suggestions

**Demo Mode (Current)**
- 🔓 Plugins run with full access (permissive mode)
- For demonstration & testing purposes
- Shows what zero-trust will prevent in production

**Attack Simulation**
- 🛡️ Visual security proof via attack simulation
- Demonstrates vulnerabilities in demo mode
- Shows how production will be protected

**Compliance Management**
- Multi-framework compliance tracking (SOC2, GDPR, OWASP, PCI-DSS, HIPAA, ISO 27001)
- Compliance violation monitoring
- Framework control pass rates
- Remediation timeline tracking

**Advanced Analytics**
- Historical security trends (30+ scans)
- Scan performance metrics
- Peak and average security scores
- CSV export functionality

**GitLab Integration**
- Real-time data from GitLab repositories
- Automated scan history tracking
- Multi-format project input (ID, SSH, HTTPS URLs)
- Secure token-based authentication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- GitLab account with API access

### Installation

1. **Clone and Install Dependencies**
```bash
git clone https://github.com/YOUR_USERNAME/asrorepo-frontend
cd asrorepo-frontend
npm install
```

2. **Configure Environment Variables**

Create `.env.local` in the project root:

```env
# GitLab API Configuration
VITE_GITLAB_API_URL=https://gitlab.com/api/v4
VITE_GITLAB_TOKEN=your_gitlab_token_here
VITE_GITLAB_PROJECT_ID=79598942

# Auto-refresh Settings
VITE_AUTO_REFRESH_ENABLED=true
VITE_REFRESH_INTERVAL=30000

# Firebase Configuration (Optional)
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

3. **Get GitLab Token**

- Go to GitLab → Settings → Access Tokens
- Create token with scopes: `api` + `read_repository`
- Copy and paste into `.env.local`

4. **Run Development Server**

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 📊 Dashboard Pages

### Security Dashboard
- **Security Score**: Overall security rating (0-100)
- **Issue Distribution**: Critical → High → Medium → Low
- **Scan Status**: Pass/Fail, branch info, files scanned
- **Top 5 Issues**: Most critical vulnerabilities
- **Recommendations**: AI-generated remediation steps

### Compliance Dashboard
- **Compliance Score**: Regulatory alignment rating
- **Framework Status**: 6 compliance frameworks tracked
- **Control Pass Rates**: Detailed% per framework
- **Active Violations**: Issues by severity
- **Remediation Timeline**: Recent compliance improvements

### Analytics Dashboard
- **Security Trends**: 30-scan history visualization
- **Statistics**: Average, peak, and low scores
- **Scan History Table**: Full audit trail (10 most recent)
- **Performance Metrics**: Scan duration, files scanned
- **Data Export**: Download historical data as CSV

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── ScoreCard.tsx      # Metric display cards
│   │   ├── ChartWrapper.tsx   # Chart container
│   │   ├── Badge.tsx          # Status indicators
│   │   └── LoadingSpinner.tsx # Loading animation
│   ├── Layout.tsx             # Main layout with sidebar
│   ├── ErrorBoundary.tsx      # Error handling
│   └── PageRenderer.tsx       # Route/page mapper
├── pages/
│   ├── SecurityDashboard.tsx  # Security metrics
│   ├── Compliance.tsx         # Compliance tracking
│   └── Analytics.tsx          # Historical trends
├── hooks/
│   └── useGitLabData.ts       # GitLab data fetching
├── services/
│   └── gitlabDataService.ts   # API client
├── utils/
│   ├── metricCalculations.ts  # 17 calculation functions
│   ├── animations.ts          # Motion library presets
│   └── gitlabProjectParser.ts # URL parser
├── App.tsx                     # Root component
└── main.tsx                   # Entry point
```

## 🔐 Security Features

- **XSS Protection**: Input sanitization on all external data
- **Error Boundaries**: Prevents full app crashes
- **Environment Variables**: Secure credential storage
- **Token Authentication**: GitLab API token management
- **Input Validation**: All data validated before use
- **Pagination**: Large datasets handled safely

## 📈 Performance

- **Bundle Size**: ~150KB (gzipped)
- **Initial Load**: <2s on 4G
- **Refresh Interval**: Configurable (default: 30s)
- **Code Splitting**: Page-level lazy loading
- **Responsive Design**: Mobile, tablet, desktop

## 🛠️ API Integration

### Data Endpoints

**Latest Scan Data**
```typescript
const { latestScan } = useGitLabDashboardData();
// Contains: score, summary, metrics, issues, recommendations
```

**Scan History**
```typescript
const { scans } = useGitLabDashboardData();
// Array of historical scans for trending
```

**Compliance Data**
```typescript
const { compliance } = useGitLabDashboardData();
// Contains: score, violations, frameworks
```

**SBOM Data**
```typescript
const { sbom } = useGitLabDashboardData();
// Contains: dependencies with vulnerability status
```

### Manual API Calls

```typescript
import { gitlabDataService } from './services/gitlabDataService';

// Fetch specific data
const scanData = await gitlabDataService.fetchRawFile('scan_history.json');
const complianceReport = await gitlabDataService.fetchComplianceReport();
const sbomData = await gitlabDataService.fetchSBOM();

// Fetch all dashboard data at once
const allData = await gitlabDataService.fetchAllDashboardData();
```

## 🎨 Customization

### Theme Colors

Edit `src/index.css` to customize GitLab theme:

```css
@theme {
  --color-gitlab-orange: #e24329;
  --color-gitlab-purple: #6b4fbb;
  --color-gitlab-dark: #100f2b;
}
```

### Component Props

ScoreCard example:
```typescript
<ScoreCard
  title="Security Score"
  score={85}
  max={100}
  color="emerald"          // 'orange' | 'purple' | 'emerald' | 'red' | 'blue'
  trend="up"               // 'up' | 'down' | 'stable'
  trendValue={5}           // percentage
  icon={<Shield size={20} />}
  subtitle="Low Risk"
/>
```

## � For Frontend Developers

### New to the Project?

1. **Read** [ONBOARDING.md](ONBOARDING.md) - Complete developer setup guide
2. **Understand** [ARCHITECTURE.md](ARCHITECTURE.md) - Component structure & data flow
3. **Follow** [CONTRIBUTING.md](CONTRIBUTING.md) - Coding standards & PR process
4. **Review** [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Community guidelines

### Developer Commands

```bash
# Setup
npm install
npm run cli setup                    # Interactive setup wizard

# Development
npm run dev                          # Start dev server
npm run cli watch                    # Watch mode with auto-reload
npm run cli lint:fix                 # Fix all linting issues

# Building & Testing
npm run build                        # Build for production
npm run preview                      # Preview production build
npm run lint                         # Check TypeScript
npm run cli test                     # Run tests

# Documentation
npm run cli docs:generate            # Generate component docs
npm run cli wiki:sync                # Sync frontend features to GitLab wiki
npm run cli docs:serve               # Serve documentation locally (port 8000)

# Database & Data
npm run cli db:seed                  # Seed sample data
npm run cli db:migrate               # Run migrations
npm run cli data:export              # Export dashboard data as JSON

# Utilities
npm run cli serve --port 5173        # Custom dev server
npm run cli analyze                  # Analyze bundle size
```

## �📋 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint TypeScript
npm lint
```

## 🚀 Deployment

> **📚 For comprehensive deployment instructions, see [DEPLOYMENT_ADVANCED.md](DEPLOYMENT_ADVANCED.md)**

### Quick Start - GitHub Pages

```bash
# 1. Install gh-pages
npm install --save-dev gh-pages

# 2. Build and deploy
npm run deploy

# 3. Site will be available at:
# https://YOUR_USERNAME.github.io/asrorepo-frontend
```

### Deployment Guides

- **[DEPLOYMENT_ADVANCED.md](DEPLOYMENT_ADVANCED.md)** - Complete production deployment guide
  - GitHub Pages setup
  - Environment configuration
  - CI/CD integration with GitHub Actions
  - Custom domain setup
  - Monitoring & logging
  - Security checklist
  - Troubleshooting

- **[DEPLOYMENT_CHECKLIST_ADVANCED.md](DEPLOYMENT_CHECKLIST_ADVANCED.md)** - Pre-deployment verification
  - Repository setup checks
  - Environment variables verification
  - Code quality validation
  - Build optimization checks
  - Security verification
  - Post-deployment verification

- **[DEPLOYMENT_COMMANDS.md](DEPLOYMENT_COMMANDS.md)** - Quick command reference
  - Common npm scripts
  - Deployment procedures
  - GitHub Secrets setup
  - Health checks & monitoring
  - Troubleshooting commands

### Environment Variables in Production

Set environment variables in GitHub Actions via Settings → Secrets → Actions:
- `GITLAB_API_URL` → `https://gitlab.com/api/v4`
- `GITLAB_TOKEN` → Your GitLab token (read-only with `api` + `read_repository` scopes)
- `GITLAB_PROJECT_ID` → `79598942`
- `SLACK_WEBHOOK` (optional) → Slack notification webhook

## 🐛 Troubleshooting

**GitLab Data Not Loading?**
- Check `.env.local` has correct token
- Verify token has `api` scope
- Check browser console for CORS errors
- Ensure project ID is correct

**Styling Looks Wrong?**
- Clear browser cache: Ctrl+Shift+Delete
- Rebuild: `npm run build`
- Check Tailwind is configured: `tailwind.config.js`

**TypeScript Errors?**
```bash
npm run lint
# Fix issues or update types as needed
```

**Performance Slow?**
- Check auto-refresh interval (default 30s)
- Reduce in `.env.local`: `VITE_REFRESH_INTERVAL=60000`
- Check network tab for large payloads

## 📞 Support

- **Backend Issues**: See [GitLab ASRO Repo](https://gitlab.com/git-lab-AI-hackathon/asrorepo)
- **Frontend Issues**: Create GitHub issue
- **GitLab Integration**: Check [GitLab API Docs](https://docs.gitlab.com/ee/api/)

### Support Development

Love this project? Help keep it alive! ❤️

[![PayPal Donate](https://img.shields.io/badge/PayPal-Donate-00457C?style=flat-square&logo=paypal)](https://paypal.me/Ironhitz)

Your donations help us:
- 🚀 Add new features faster
- 🔒 Improve security & performance
- 📚 Create better documentation
- 🐛 Fix bugs quickly
- 💰 Sustain long-term development

**Every contribution matters. Thank you!**

## 📄 License

MIT License - See LICENSE file

## 🎯 Roadmap

- [ ] Real-time WebSocket updates
- [ ] Custom dashboard widgets
- [ ] Multi-project dashboards
- [ ] Advanced alerts & notifications
- [ ] Dark/Light theme toggle
- [ ] Accessibility (WCAG AA)
- [ ] Unit & integration tests
- [ ] Mobile app (React Native)

---

**Built with ❤️ for Security Excellence**  
*Last Updated: March 2026*
