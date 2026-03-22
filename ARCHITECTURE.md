# 🏗️ Architecture Guide

Understanding the ASRO Frontend architecture helps you contribute effectively and make better design decisions.

---

## 📊 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
├─────────────────────────────────────────────────────────────┤
│  React 19 Application (Vite SPA)                            │
│  ├── Components Layer (UI)                                  │
│  ├── Pages Layer (Screens)                                  │
│  ├── Services Layer (API Calls)                             │
│  └── State Management (React Hooks)                         │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
        GitLab API v4                   Firebase (Optional)
        (Read-Only)                    (Backend Services)
               │                              │
         ┌─────▼──────────┐            ┌─────▼──────────┐
         │  GitLab.com    │            │  Firebase DB   │
         │  - Projects    │            │  - Firestore   │
         │  - Scans       │            │  - Auth        │
         │  - Issues      │            │  - Storage     │
         │  - Compliance  │            │  - Functions   │
         └────────────────┘            └────────────────┘
```

---

## 🎯 Data Flow

### 1. User Interaction
```
User Action → React Component → Event Handler → Service Call
```

### 2. Data Retrieval
```
Component Mounted → useEffect → Service → GitLab API → Parse → State Update
```

### 3. Rendering
```
State Change → Component Re-render → DOM Update → Browser Display
```

---

## 📁 Directory Structure

```
asrorepo-frontend/
├── src/
│   ├── components/
│   │   ├── ui/                          # Reusable UI components
│   │   │   ├── Badge.tsx               # Status indicators
│   │   │   ├── ScoreCard.tsx           # Metric display
│   │   │   ├── ChartWrapper.tsx        # Chart container
│   │   │   ├── LoadingSpinner.tsx      # Loading animation
│   │   │   └── ErrorBoundary.tsx       # Error handling
│   │   ├── Layout.tsx                   # Main layout with sidebar
│   │   ├── Sidebar.tsx                  # Navigation menu
│   │   ├── PageRenderer.tsx             # Route mapping
│   │   ├── ActivityFeed.tsx             # Activity stream
│   │   ├── AgentGraph.tsx               # Agent visualization
│   │   ├── Terminal.tsx                 # Terminal component
│   │   ├── ThreatModel.tsx              # Threat modeling display
│   │   └── PipelineIntelligence.tsx    # Pipeline metrics
│   │
│   ├── pages/
│   │   ├── SecurityDashboard.tsx        # Security metrics page
│   │   ├── Compliance.tsx               # Compliance page
│   │   └── Analytics.tsx                # Analytics page
│   │
│   ├── hooks/
│   │   └── useGitLabData.ts            # GitLab data hook (custom hook)
│   │
│   ├── services/
│   │   ├── gitlabDataService.ts        # GitLab API client
│   │   └── aiOrchestration.ts          # AI service integration
│   │
│   ├── utils/
│   │   ├── metricCalculations.ts       # Metric calculations
│   │   ├── animations.ts                # Animation presets
│   │   └── gitlabProjectParser.ts      # URL parsing
│   │
│   ├── types.ts                         # TypeScript types
│   ├── App.tsx                          # Root component
│   ├── main.tsx                         # Entry point
│   ├── firebase.ts                      # Firebase config
│   ├── index.css                        # Global styles
│   └── seed.ts                          # Sample data
│
├── public/
│   └── CNAME                            # Custom domain config
│
├── .github/
│   └── workflows/
│       ├── deploy.yml                   # GitHub Pages deployment
│       └── ci-cd.yml                    # CI/CD pipeline
│
├── server.ts                            # Express server (dev)
├── vite.config.ts                       # Vite configuration
├── tailwind.config.js                   # Tailwind config
├── tsconfig.json                        # TypeScript config
├── package.json                         # Dependencies
├── README.md                            # Documentation
├── CONTRIBUTING.md                      # Contribution guide
└── LICENSE.md                           # License

```

---

## 🧩 Component Architecture

### Component Hierarchy

```
App
├── ErrorBoundary
│   └── Layout
│       ├── Sidebar
│       │   └── MenuItem x N
│       └── PageRenderer
│           ├── SecurityDashboard
│           │   ├── ScoreCard
│           │   ├── ChartWrapper
│           │   ├── Badge
│           │   └── LoadingSpinner
│           ├── Compliance
│           │   ├── ScoreCard
│           │   └── Badge
│           └── Analytics
│               ├── ChartWrapper
│               └── Badge
```

### Component Types

#### 1. **Page Components** (Full-screen pages)
```typescript
// src/pages/SecurityDashboard.tsx
export function SecurityDashboard() {
  const { data, loading } = useGitLabDashboardData();
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="space-y-6">
      {/* Page content */}
    </div>
  );
}
```

#### 2. **Container Components** (State & logic)
```typescript
// src/components/Layout.tsx
export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex">
      <Sidebar open={sidebarOpen} onToggle={setSidebarOpen} />
      <main>{children}</main>
    </div>
  );
}
```

#### 3. **Presentational Components** (UI only)
```typescript
// src/components/ui/ScoreCard.tsx
interface ScoreCardProps {
  title: string;
  score: number;
  max?: number;
  icon?: React.ReactNode;
}

export function ScoreCard({ title, score, max = 100, icon }: ScoreCardProps) {
  return (
    <div className="card">
      {icon}
      <h3>{title}</h3>
      <p>{score}/{max}</p>
    </div>
  );
}
```

---

## 🔄 State Management

### Current Approach: React Hooks

```typescript
// Using custom hook for data fetching
export function SecurityDashboard() {
  const { latestScan, scans, compliance, loading, error } = useGitLabDashboardData();
  
  // All state managed by the hook
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return (/* Render with data */);
}
```

### Hook Pattern

```typescript
// src/hooks/useGitLabData.ts
export function useGitLabDashboardData() {
  const [latestScan, setLatestScan] = useState(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fetch data on component mount
    fetchData();
  }, []);
  
  return { latestScan, scans, loading, error };
}
```

### Future: Redux/Zustand
If state complexity increases, consider:
- **Redux**: For complex state with many actions
- **Zustand**: For simpler, more modern state management

---

## 📡 API Integration

### GitLab API Client

```typescript
// src/services/gitlabDataService.ts
class GitLabDataService {
  private apiUrl = import.meta.env.VITE_GITLAB_API_URL;
  private token = import.meta.env.VITE_GITLAB_TOKEN;
  private projectId = import.meta.env.VITE_GITLAB_PROJECT_ID;
  
  async fetchProject() {
    // GET /api/v4/projects/:id
  }
  
  async fetchMergeRequests() {
    // GET /api/v4/projects/:id/merge_requests
  }
  
  async fetchIssues() {
    // GET /api/v4/projects/:id/issues
  }
}

export const gitlabDataService = new GitLabDataService();
```

### CORS Configuration
- GitLab API handles CORS
- Browser's Same-Origin Policy respected
- Token in headers for authentication

---

## 🎨 Styling Architecture

### Tailwind CSS + Custom CSS

```typescript
// Tailwind utilities
<div className="flex flex-col gap-4 p-6 bg-white/10 rounded-lg border border-white/20">
  {/* Content */}
</div>
```

```css
/* Custom CSS (index.css) */
@theme {
  --color-gitlab-orange: #e24329;
  --color-brand-primary: #6b4fbb;
}

@layer components {
  .card {
    @apply rounded-lg border border-white/20 bg-white/10 p-6;
  }
}
```

### Design System

| Component | File | Variants |
|-----------|------|----------|
| Badge | `Badge.tsx` | success, warning, error, info |
| ScoreCard | `ScoreCard.tsx` | 5 colors, trends |
| ChartWrapper | `ChartWrapper.tsx` | Loading, error states |

---

## 🎬 Animation System

### Motion Library Integration

```typescript
// src/utils/animations.ts
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Usage
<motion.div
  initial="hidden"
  animate="visible"
  variants={fadeInUp}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

---

## 🔐 Security Architecture

### Input Validation
```typescript
// Sanitize user input
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')  // Remove angle brackets
    .trim();              // Remove whitespace
}
```

### Error Boundaries
```typescript
// Catch component errors
<ErrorBoundary>
  <SecurityDashboard />
</ErrorBoundary>
```

### Environment Variables
```env
VITE_GITLAB_API_URL=https://gitlab.com/api/v4
VITE_GITLAB_TOKEN=glpat-xxxxx
VITE_GITLAB_PROJECT_ID=79598942
```

---

## 📊 Performance Optimization

### Code Splitting
```typescript
// Lazy load pages
const SecurityDashboard = lazy(() => import('./pages/SecurityDashboard'));
const Compliance = lazy(() => import('./pages/Compliance'));

// In PageRenderer
<Suspense fallback={<LoadingSpinner />}>
  {component}
</Suspense>
```

### Memoization
```typescript
// Prevent unnecessary re-renders
export const ScoreCard = memo(function ScoreCard(props) {
  return (/* Render */);
});
```

### Data Caching
```typescript
// Cache API responses
const cache = new Map();

async function fetchWithCache(url) {
  if (cache.has(url)) return cache.get(url);
  
  const data = await fetch(url).then(r => r.json());
  cache.set(url, data);
  return data;
}
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// test/metricCalculations.test.ts
describe('calculateSecurityScore', () => {
  it('should return 0 for empty array', () => {
    expect(calculateSecurityScore([])).toBe(0);
  });
  
  it('should calculate average correctly', () => {
    const metrics = [{ score: 80 }, { score: 90 }];
    expect(calculateSecurityScore(metrics)).toBe(85);
  });
});
```

### Component Tests
```typescript
// test/ScoreCard.test.tsx
describe('ScoreCard', () => {
  it('should render title and score', () => {
    const { getByText } = render(
      <ScoreCard title="Security" score={85} />
    );
    expect(getByText('Security')).toBeInTheDocument();
    expect(getByText('85')).toBeInTheDocument();
  });
});
```

---

## 🚀 Deployment Architecture

### Build Process
```
src/ → TypeScript Compiler → JavaScript
     → Vite Bundler → Optimized Assets
     → dist/ Directory
```

### Deployment Options

| Platform | Hosting | CI/CD |
|----------|---------|-------|
| Vercel | Vercel Edge | Zero-config |
| GitHub Pages | CDN | GitHub Actions |
| Azure Static Web Apps | Azure CDN | Azure DevOps |

---

## 📈 Scalability Considerations

### Current Scaling Limits
- Single GitLab project support
- No pagination for large datasets
- Browser memory constraints

### Future Improvements
- Multiple project support
- Pagination for scan history
- WebSocket for real-time updates
- Offline support with Service Workers
- Database for local caching

---

## 🔧 Development Workflow

### Local Development
```bash
npm run dev              # Start Vite dev server
npm run lint            # Check code quality
npm run build           # Build for production
npm run preview         # Preview production build
```

### Git Workflow
```bash
git checkout -b feature/new-feature
# Make changes
npm run lint:fix        # Fix issues
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Create PR on GitHub
```

---

## 📚 Related Documents

- [ONBOARDING.md](ONBOARDING.md) - Developer onboarding
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Community standards
- [SECURITY.md](SECURITY.md) - Security best practices

---

**Last Updated:** March 22, 2026
