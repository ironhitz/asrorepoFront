# GitLab ASRO Data Integration Guide

This guide explains how to connect your ASRO frontend to the GitLab backend to display real security scan data.

## 📋 Prerequisites

1. **GitLab Personal Access Token**
   - Navigate to: https://gitlab.com/-/user_settings/personal_access_tokens
   - Create a new token with scopes: `api` and `read_repository`
   - Keep this token secure

2. **GitLab Project ID**
   - The ASRO backend project ID: `79598942`
   - Or your own GitLab project ID containing ASRO data

## 🔧 Setup Steps

### 1. Configure Environment Variables

Create `.env.local` file in the project root:

```bash
# Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key

# GitLab Configuration
VITE_GITLAB_API_URL=https://gitlab.com/api/v4
VITE_GITLAB_PROJECT_ID=79598942
VITE_GITLAB_TOKEN=your_gitlab_personal_access_token

# Data files
VITE_DATA_SCAN_HISTORY=scan_history.json
VITE_DATA_COMPLIANCE_REPORT=compliance_report.json
VITE_DATA_SBOM=sbom.json

# Polling
VITE_REFRESH_INTERVAL=30000
VITE_AUTO_REFRESH_ENABLED=true
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Application

```bash
npm run dev
```

## 📊 How Data Integration Works

### Data Flow

```
GitLab Repository
    ↓
    ├─ scan_history.json
    ├─ compliance_report.json
    └─ sbom.json
    ↓
gitlabDataService.ts
(Fetches raw files via GitLab API)
    ↓
React Hooks (useGitLabData.ts)
(Manages state & auto-refresh)
    ↓
Components
(Display data in UI)
```

### Key Files

- **`src/services/gitlabDataService.ts`** - Core GitLab API service
- **`src/hooks/useGitLabData.ts`** - React hooks for data fetching
- **`.env.local`** - Configuration and credentials

## 🎣 Using the Hooks

### In React Components

```typescript
import { useGitLabDashboardData } from '../hooks/useGitLabData';

export function MyDashboard() {
  const { latestScan, scans, compliance, sbom, isLoading, error, refresh } =
    useGitLabDashboardData();

  if (isLoading) return <Loader />;
  if (error) return <Error message={error} />;

  return (
    <div>
      <h1>Latest Scan Score: {latestScan?.score}</h1>
      <button onClick={refresh}>Refresh Data</button>
    </div>
  );
}
```

### Available Hooks

- `useGitLabDashboardData()` - All dashboard data with auto-refresh
- `useGitLabScanHistory()` - Scan history only
- `useGitLabComplianceReport()` - Compliance data only
- `useGitLabSBOM()` - Software Bill of Materials
- `useGitLabRecentCommits(maxResults)` - Recent commits
- `useGitLabPipelines(maxResults)` - Pipeline information

## 🔄 Auto-Refresh Configuration

Control how often data refreshes:

```env
# Refresh every 30 seconds (in milliseconds)
VITE_REFRESH_INTERVAL=30000

# Enable/disable auto-refresh
VITE_AUTO_REFRESH_ENABLED=true
```

Or manually refresh:

```typescript
const { refresh } = useGitLabDashboardData();

// Refresh on demand
await refresh();
```

## 🛡️ Security Notes

- **Never commit `.env.local`** to version control
- **Use scoped tokens** (read-only access only)
- **Regenerate tokens** if leaked
- **Use HTTPS** for all API calls (automatic with GitLab.com)

## 📈 Data Types

### ScanData

```typescript
interface ScanData {
  timestamp: string;
  score: number;
  passed: boolean;
  summary: {
    critical: number;
    high: number;
    medium: number;
    total_issues: number;
  };
  metrics: {
    files_scanned: number;
    secrets_found: number;
    deprecated_packages: number;
    scan_duration_ms: number;
  };
}
```

### ComplianceData

```typescript
interface ComplianceData {
  timestamp: string;
  score: number;
  passed: boolean;
  violations: string[];
}
```

### SBOMData

```typescript
interface SBOMData {
  dependencies: Array<{
    name: string;
    version: string;
    vulnerability_found?: boolean;
    cve?: string;
  }>;
}
```

## 🧪 Testing Integration

### Verify Configuration

```typescript
import { gitlabDataService } from './services/gitlabDataService';

const status = gitlabDataService.getConfigStatus();
console.log(status);
// Output:
// {
//   configured: true,
//   hasToken: true,
//   hasProjectId: true,
//   warnings: []
// }
```

### Test Data Fetch

```typescript
const scans = await gitlabDataService.fetchScanHistory();
console.log('Fetched scans:', scans);
```

## 🐛 Troubleshooting

### "GitLab token not configured"

- Check `.env.local` exists in project root
- Verify `VITE_GITLAB_TOKEN` is set
- Ensure token has `api` scope

### "Failed to fetch scan_history.json"

- Verify GitLab project ID is correct
- Check if file exists in repository
- Ensure token has `read_repository` scope

### CORS Errors

- GitLab API supports CORS from web browsers
- Check browser console for actual error
- Verify API URL is correct

### Rate Limiting

- GitLab API has rate limits (600 req/hour for unauthenticated)
- Increase `VITE_REFRESH_INTERVAL` if hitting limits
- Consider using `read_api` scope for higher limits

## 📞 Support

For issues with:

- **GitLab API**: https://docs.gitlab.com/ee/api/
- **ASRO Backend**: https://gitlab.com/git-lab-AI-hackathon/asrorepo
- **React Hooks**: Check `src/hooks/useGitLabData.ts` for documentation

## 🚀 Next Steps

1. Test integration with `npm run dev`
2. Verify data appears in components
3. Customize polling interval as needed
4. Add error handling UI
5. Deploy to production

---

**Version**: 1.0  
**Last Updated**: March 2026  
**Status**: Production Ready
