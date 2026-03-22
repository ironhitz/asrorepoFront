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

## 📋 Available Scripts

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

### GitHub Pages

1. **Build the app**
```bash
npm run build
```

2. **Deploy to GitHub Pages**
```bash
# Add to package.json:
"deploy": "npm run build && gh-pages -d dist"

npm run deploy
```

3. **Configure GitHub Pages**
- Go to Settings → Pages
- Select `gh-pages` branch
- Custom domain (optional)

### Environment Variables in Production

Set environment variables in GitHub Actions or hosting platform:
- `VITE_GITLAB_API_URL`
- `VITE_GITLAB_TOKEN`
- `VITE_GITLAB_PROJECT_ID`
- `VITE_AUTO_REFRESH_ENABLED`
- `VITE_REFRESH_INTERVAL`

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
