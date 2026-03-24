export class GitLabApiAdapter {
  constructor(token, baseUrl = 'https://gitlab.com/api/v4') {
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
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export class ApiGitAdapter {
  constructor(gitlabAdapter) {
    this.gitlab = gitlabAdapter;
  }

  async status() {
    const changes = await this.gitlab.get('/repository/status');
    return changes;
  }

  async diff() {
    return '';
  }

  async add(files) {
    return 'Add not supported in API mode';
  }

  async commit(message) {
    return 'Commit not supported in API mode';
  }

  async push(remote = 'origin', branch = 'main') {
    return `Push not supported in API mode. Use asro pipeline run to trigger CI/CD.`;
  }
}

export function createGitLabClient(token, baseUrl) {
  return new GitLabApiAdapter(token, baseUrl);
}