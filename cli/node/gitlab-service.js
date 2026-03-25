import { NodeGitAdapter } from './git-adapter.js';

const GITLAB_API = 'https://gitlab.com/api/v4';

export async function triggerPipeline(projectId, token, ref = 'main') {
  const response = await fetch(`${GITLAB_API}/projects/${projectId}/pipeline?ref=${ref}`, {
    method: 'POST',
    headers: { 
      'PRIVATE-TOKEN': token,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

export async function getVulnerabilities(projectId, token) {
  const response = await fetch(`${GITLAB_API}/projects/${projectId}/vulnerabilities`, {
    headers: { 'PRIVATE-TOKEN': token }
  });
  return response.json();
}

export async function getProjects(token, membership = true) {
  const response = await fetch(`${GITLAB_API}/projects?membership=${membership}&per_page=50`, {
    headers: { 'PRIVATE-TOKEN': token }
  });
  return response.json();
}

export async function getProject(projectId, token) {
  const response = await fetch(`${GITLAB_API}/projects/${projectId}`, {
    headers: { 'PRIVATE-TOKEN': token }
  });
  return response.json();
}

export async function getPipelines(projectId, token, perPage = 5) {
  const response = await fetch(`${GITLAB_API}/projects/${projectId}/pipelines?per_page=${perPage}`, {
    headers: { 'PRIVATE-TOKEN': token }
  });
  return response.json();
}

export async function getRepositoryTree(projectId, token, recursive = true, path = '') {
  const params = new URLSearchParams({ recursive: String(recursive) });
  if (path) params.append('path', path);
  const response = await fetch(`${GITLAB_API}/projects/${projectId}/repository/tree?${params}`, {
    headers: { 'PRIVATE-TOKEN': token }
  });
  return response.json();
}

export async function getFileContent(projectId, token, filePath, ref = 'main') {
  const response = await fetch(`${GITLAB_API}/projects/${projectId}/repository/files/${encodeURIComponent(filePath)}/raw?ref=${ref}`, {
    headers: { 'PRIVATE-TOKEN': token }
  });
  return response.text();
}

export async function createBranch(projectId, token, branchName, ref) {
  const response = await fetch(`${GITLAB_API}/projects/${projectId}/repository/branches`, {
    method: 'POST',
    headers: { 
      'PRIVATE-TOKEN': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ branch: branchName, ref })
  });
  return response.json();
}

export async function createMergeRequest(projectId, token, sourceBranch, targetBranch = 'main', title, description) {
  const response = await fetch(`${GITLAB_API}/projects/${projectId}/merge_requests`, {
    method: 'POST',
    headers: { 
      'PRIVATE-TOKEN': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      source_branch: sourceBranch, 
      target_branch: targetBranch, 
      title: title || 'Automated MR',
      description: description || 'Created via ASRO CLI'
    })
  });
  return response.json();
}

export async function getCurrentUser(token) {
  const response = await fetch(`${GITLAB_API}/user`, {
    headers: { 'PRIVATE-TOKEN': token }
  });
  return response.json();
}

export class GitLabService {
  constructor(token, baseUrl = GITLAB_API) {
    this.token = token;
    this.baseUrl = baseUrl;
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'PRIVATE-TOKEN': this.token,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`GitLab API error: ${error.message || response.status}`);
    }
    
    return response.json();
  }
  
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }
  
  async post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  }
}