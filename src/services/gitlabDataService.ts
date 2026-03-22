/**
 * GitLab Data Integration Service for ASRO Frontend
 * Fetches scan data, compliance reports, and metrics from GitLab repository
 */

export interface ScanData {
  timestamp: string;
  scan_type: string;
  repository_url: string;
  repository_name: string;
  branch: string;
  score: number;
  threshold: number;
  passed: boolean;
  issues: any[];
  violations: string[];
  metrics: {
    files_scanned: number;
    secrets_found: number;
    deprecated_packages: number;
    missing_docs: number;
    scan_duration_ms: number;
  };
  summary: {
    total_issues: number;
    critical: number;
    high: number;
    medium: number;
    total_deductions: number;
  };
  recommendations: string[];
}

export interface ComplianceData {
  timestamp: string;
  score: number;
  passed: boolean;
  issues: any[];
  violations: string[];
}

export interface SBOMData {
  generated: string;
  dependencies: Array<{
    name: string;
    version: string;
    vulnerability_found?: boolean;
    cve?: string;
  }>;
}

class GitLabDataService {
  private apiUrl: string;
  private projectId: string;
  private token: string;
  private timeout: number;

  constructor() {
    this.apiUrl = import.meta.env.VITE_GITLAB_API_URL || 'https://gitlab.com/api/v4';
    this.projectId = import.meta.env.VITE_GITLAB_PROJECT_ID || '79598942';
    this.token = import.meta.env.VITE_GITLAB_TOKEN || '';
    this.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10);

    if (!this.token) {
      console.warn('GitLab token not configured. GitLab data integration disabled.');
    }
  }

  /**
   * Fetch raw file from GitLab repository
   */
  async fetchRawFile<T>(filePath: string, branch = 'main'): Promise<T | null> {
    if (!this.token) {
      console.error('GitLab token not configured');
      return null;
    }

    const url = `${this.apiUrl}/projects/${this.projectId}/repository/files/${encodeURIComponent(
      filePath
    )}/raw?ref=${branch}`;

    try {
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        console.error(`Failed to fetch ${filePath}:`, response.status, response.statusText);
        return null;
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error(`Error fetching ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Fetch latest scan history from GitLab
   */
  async fetchScanHistory(): Promise<ScanData[]> {
    const fileName = import.meta.env.VITE_DATA_SCAN_HISTORY || 'scan_history.json';
    const data = await this.fetchRawFile<{ scans: ScanData[] }>(fileName);
    return data?.scans || [];
  }

  /**
   * Fetch compliance report from GitLab
   */
  async fetchComplianceReport(): Promise<ComplianceData | null> {
    const fileName = import.meta.env.VITE_DATA_COMPLIANCE_REPORT || 'compliance_report.json';
    return await this.fetchRawFile<ComplianceData>(fileName);
  }

  /**
   * Fetch SBOM from GitLab
   */
  async fetchSBOM(): Promise<SBOMData | null> {
    const fileName = import.meta.env.VITE_DATA_SBOM || 'sbom.json';
    return await this.fetchRawFile<SBOMData>(fileName);
  }

  /**
   * Fetch project information
   */
  async fetchProjectInfo(): Promise<any> {
    const url = `${this.apiUrl}/projects/${this.projectId}`;
    try {
      const response = await this.fetchWithTimeout(url);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error fetching project info:', error);
      return null;
    }
  }

  /**
   * Fetch recent commits
   */
  async fetchRecentCommits(maxResults = 10): Promise<any[]> {
    const url = `${this.apiUrl}/projects/${this.projectId}/repository/commits?per_page=${maxResults}`;
    try {
      const response = await this.fetchWithTimeout(url);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error fetching commits:', error);
      return [];
    }
  }

  /**
   * Fetch pipelines
   */
  async fetchPipelines(maxResults = 5): Promise<any[]> {
    const url = `${this.apiUrl}/projects/${this.projectId}/pipelines?per_page=${maxResults}`;
    try {
      const response = await this.fetchWithTimeout(url);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error fetching pipelines:', error);
      return [];
    }
  }

  /**
   * Fetch all dashboard data in parallel
   */
  async fetchAllDashboardData() {
    try {
      const [scans, compliance, sbom] = await Promise.all([
        this.fetchScanHistory(),
        this.fetchComplianceReport(),
        this.fetchSBOM(),
      ]);

      return {
        latestScan: scans.length > 0 ? scans[scans.length - 1] : null,
        scans,
        compliance,
        sbom,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {
        latestScan: null,
        scans: [],
        compliance: null,
        sbom: null,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Helper: Fetch with timeout
   */
  private fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    return fetch(url, {
      headers: {
        'PRIVATE-TOKEN': this.token,
        Accept: 'application/json',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
  }

  /**
   * Check if GitLab integration is properly configured
   */
  isConfigured(): boolean {
    return !!this.token && !!this.projectId;
  }

  /**
   * Get configuration status
   */
  getConfigStatus(): {
    configured: boolean;
    hasToken: boolean;
    hasProjectId: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];

    if (!this.token) {
      warnings.push('GitLab token not configured (VITE_GITLAB_TOKEN)');
    }
    if (!this.projectId) {
      warnings.push('GitLab project ID not configured (VITE_GITLAB_PROJECT_ID)');
    }

    return {
      configured: this.isConfigured(),
      hasToken: !!this.token,
      hasProjectId: !!this.projectId,
      warnings,
    };
  }
}

// Export singleton instance
export const gitlabDataService = new GitLabDataService();
export default GitLabDataService;
