/**
 * GitLab API Wrapper for ASRO CLI
 * Provides unified interface for all GitLab operations
 */

import https from 'https';
import { URL } from 'url';

export class GitLabClient {
  private projectId: string;
  private token: string;
  private baseUrl: string;

  constructor(projectId: string, token: string, baseUrl = 'https://gitlab.com/api/v4') {
    this.projectId = projectId;
    this.token = token;
    this.baseUrl = baseUrl;
  }

  /**
   * Make HTTP request to GitLab API
   */
  async request<T>(method: string, endpoint: string, data: any = null): Promise<T> {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'PRIVATE-TOKEN': this.token,
          'Content-Type': 'application/json',
          'User-Agent': 'ASRO-CLI/1.0.0'
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            if (body === '') {
              if (res.statusCode && res.statusCode >= 400) {
                reject(new Error(`GitLab API Error (${res.statusCode})`));
              } else {
                resolve({} as T);
              }
              return;
            }
            const response = JSON.parse(body);
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`GitLab API Error (${res.statusCode}): ${JSON.stringify(response)}`));
            } else {
              resolve(response);
            }
          } catch (e) {
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`GitLab API Error (${res.statusCode}): ${body}`));
            } else {
              resolve(body as unknown as T);
            }
          }
        });
      });

      req.on('error', reject);
      if (data) req.write(JSON.stringify(data));
      req.end();
    });
  }

  // ============================================
  // PROJECT OPERATIONS
  // ============================================

  async getCurrentUser(): Promise<any> {
    return this.request<any>('GET', '/user');
  }

  async getProject() {
    return this.request<any>('GET', `/projects/${this.projectId}`);
  }

  async listBranches() {
    return this.request<any[]>('GET', `/projects/${this.projectId}/repository/branches`);
  }

  async getBranch(branchName: string) {
    return this.request<any>('GET', `/projects/${this.projectId}/repository/branches/${encodeURIComponent(branchName)}`);
  }

  async createBranch(branch: string, ref = 'main') {
    return this.request<any>('POST', `/projects/${this.projectId}/repository/branches`, {
      branch,
      ref
    });
  }

  async getRepositoryTree(options: any = {}) {
    const query = new URLSearchParams(options).toString();
    return this.request<any[]>('GET', `/projects/${this.projectId}/repository/tree?${query}`);
  }

  async getFileRaw(filePath: string, ref = 'main') {
    return this.request<string>('GET', `/projects/${this.projectId}/repository/files/${encodeURIComponent(filePath)}/raw?ref=${ref}`);
  }

  // ============================================
  // MERGE REQUEST OPERATIONS
  // ============================================

  async listMergeRequests(filters: any = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request<any[]>('GET', `/projects/${this.projectId}/merge_requests?${query}`);
  }

  async getMergeRequest(mrIid: number) {
    return this.request<any>('GET', `/projects/${this.projectId}/merge_requests/${mrIid}`);
  }

  async createMergeRequest(sourceBranch: string, targetBranch: string, title: string, options: any = {}) {
    const data = {
      source_branch: sourceBranch,
      target_branch: targetBranch,
      title: title,
      description: options.description || '',
      labels: options.labels || [],
      assignee_ids: options.assignees || [],
      reviewer_ids: options.reviewers || [],
      remove_source_branch: options.removeSourceBranch !== false,
      squash: options.squash || false
    };
    return this.request<any>('POST', `/projects/${this.projectId}/merge_requests`, data);
  }

  async updateMergeRequest(mrIid: number, updates: any) {
    return this.request<any>('PUT', `/projects/${this.projectId}/merge_requests/${mrIid}`, updates);
  }

  async mergeMergeRequest(mrIid: number, options: any = {}) {
    const data = {
      merge_when_pipeline_succeeds: options.mergeWhenPipelineSucceeds || false,
      squash: options.squash || false,
      should_remove_source_branch: options.removeSourceBranch !== false
    };
    return this.request<any>('PUT', `/projects/${this.projectId}/merge_requests/${mrIid}/merge`, data);
  }

  async getMergeRequestDiffs(mrIid: number) {
    return this.request<any[]>('GET', `/projects/${this.projectId}/merge_requests/${mrIid}/diffs`);
  }

  async getMergeRequestNotes(mrIid: number) {
    return this.request<any[]>('GET', `/projects/${this.projectId}/merge_requests/${mrIid}/notes`);
  }

  async addMergeRequestNote(mrIid: number, body: string) {
    return this.request<any>('POST', `/projects/${this.projectId}/merge_requests/${mrIid}/notes`, { body });
  }

  // ============================================
  // COMMIT OPERATIONS
  // ============================================

  async getCommit(sha: string) {
    return this.request<any>('GET', `/projects/${this.projectId}/repository/commits/${sha}`);
  }

  async getCommitDiff(sha: string) {
    return this.request<any[]>('GET', `/projects/${this.projectId}/repository/commits/${sha}/diff`);
  }

  async createCommit(branch: string, message: string, actions: any[]) {
    const data = {
      branch: branch,
      commit_message: message,
      actions: actions
    };
    return this.request<any>('POST', `/projects/${this.projectId}/repository/commits`, data);
  }

  // ============================================
  // PIPELINE OPERATIONS
  // ============================================

  async listPipelines(filters: any = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request<any[]>('GET', `/projects/${this.projectId}/pipelines?${query}`);
  }

  async getPipeline(pipelineId: number) {
    return this.request<any>('GET', `/projects/${this.projectId}/pipelines/${pipelineId}`);
  }

  async triggerPipeline(ref = 'main', variables: any = {}) {
    const data = {
      ref: ref,
      variables: variables
    };
    return this.request<any>('POST', `/projects/${this.projectId}/pipeline`, data);
  }

  async getPipelineJobs(pipelineId: number) {
    return this.request<any[]>('GET', `/projects/${this.projectId}/pipelines/${pipelineId}/jobs`);
  }

  async cancelPipeline(pipelineId: number) {
    return this.request<any>('POST', `/projects/${this.projectId}/pipelines/${pipelineId}/cancel`);
  }

  // ============================================
  // ISSUE OPERATIONS
  // ============================================

  async listIssues(filters: any = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request<any[]>('GET', `/projects/${this.projectId}/issues?${query}`);
  }

  async getIssue(issueIid: number) {
    return this.request<any>('GET', `/projects/${this.projectId}/issues/${issueIid}`);
  }

  async createIssue(title: string, options: any = {}) {
    const data = {
      title: title,
      description: options.description || '',
      labels: options.labels || [],
      assignee_ids: options.assignees || [],
      due_date: options.dueDate || null
    };
    return this.request<any>('POST', `/projects/${this.projectId}/issues`, data);
  }

  async updateIssue(issueIid: number, updates: any) {
    return this.request<any>('PUT', `/projects/${this.projectId}/issues/${issueIid}`, updates);
  }

  async closeIssue(issueIid: number) {
    return this.updateIssue(issueIid, { state_event: 'close' });
  }

  // ============================================
  // VULNERABILITY OPERATIONS (Ultimate License)
  // ============================================

  async listVulnerabilities(filters: any = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request<any[]>('GET', `/projects/${this.projectId}/vulnerabilities?${query}`);
  }

  async getVulnerability(vulnId: number) {
    return this.request<any>('GET', `/projects/${this.projectId}/vulnerabilities/${vulnId}`);
  }

  async dismissVulnerability(vulnId: number, reason: string, comment: string) {
    const data = {
      reason: reason,
      comment: comment
    };
    return this.request<any>('POST', `/projects/${this.projectId}/vulnerabilities/${vulnId}/dismiss`, data);
  }

  async confirmVulnerability(vulnId: number, comment = '') {
    const data = { comment };
    return this.request<any>('POST', `/projects/${this.projectId}/vulnerabilities/${vulnId}/confirm`, data);
  }

  async revertVulnerability(vulnId: number, comment = '') {
    const data = { comment };
    return this.request<any>('POST', `/projects/${this.projectId}/vulnerabilities/${vulnId}/revert_to_detected`, data);
  }

  // ============================================
  // CI/CD VARIABLES
  // ============================================

  async listVariables() {
    return this.request<any[]>('GET', `/projects/${this.projectId}/variables`);
  }

  async createVariable(key: string, value: string, options: any = {}) {
    const data = {
      key: key,
      value: value,
      protected: options.protected || false,
      masked: options.masked || false
    };
    return this.request<any>('POST', `/projects/${this.projectId}/variables`, data);
  }

  async updateVariable(key: string, value: string, options: any = {}) {
    const data = {
      value: value,
      protected: options.protected || false,
      masked: options.masked || false
    };
    return this.request<any>('PUT', `/projects/${this.projectId}/variables/${key}`, data);
  }

  async deleteVariable(key: string) {
    return this.request<any>('DELETE', `/projects/${this.projectId}/variables/${key}`);
  }

  // ============================================
  // CONVENIENCE METHODS FOR ASRO CLI
  // ============================================

  async createSecurityPatchMR(vulnerabilities: any[], description = '') {
    const timestamp = new Date().toISOString().slice(0, 10);
    const branchName = `security-patch-${timestamp}`;
    const title = `Security: Patch ${vulnerabilities.length} vulnerabilities`;
    
    const fullDescription = `## Security Patch\n\nThis MR patches the following vulnerabilities:\n\n${vulnerabilities.map(v => `- ${v.title} (${v.severity})`).join('\n')}\n\n${description}`;

    return this.createMergeRequest(branchName, 'main', title, {
      description: fullDescription,
      labels: ['security', 'automated']
    });
  }

  async createComplianceIssue(title: string, findings: string[]) {
    const description = `## Compliance Findings\n\n${findings.map(f => `- ${f}`).join('\n')}`;
    return this.createIssue(title, {
      description: description,
      labels: ['compliance']
    });
  }

  async createThreatModelIssue(threatModel: any) {
    return this.createIssue('Threat Model: ' + threatModel.title, {
      description: threatModel.description,
      labels: ['threat-model', 'security']
    });
  }

  async batchDismissVulnerabilities(vulnIds: number[], reason: string, comment: string) {
    const results = [];
    for (const vulnId of vulnIds) {
      try {
        const result = await this.dismissVulnerability(vulnId, reason, comment);
        results.push({ vulnId, success: true, result });
      } catch (error: any) {
        results.push({ vulnId, success: false, error: error.message });
      }
    }
    return results;
  }

  async getSecuritySummary() {
    try {
      const vulns = await this.listVulnerabilities();
      const pipelines = await this.listPipelines({ per_page: 5 });
      
      return {
        totalVulnerabilities: Array.isArray(vulns) ? vulns.length : 0,
        vulnerabilities: vulns,
        recentPipelines: pipelines,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
