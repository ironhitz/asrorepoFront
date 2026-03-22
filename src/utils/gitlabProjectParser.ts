/**
 * GitLab Project URL Parser
 * Converts various GitLab repo link formats to project ID
 */

export interface ParsedGitLabProject {
  projectId: string;
  namespace: string;
  name: string;
  format: 'numeric-id' | 'https-url' | 'ssh-url' | 'web-url';
}

/**
 * Parse various GitLab project link formats
 * Supports:
 * - Numeric Project ID: 79598942
 * - HTTPS URL: https://gitlab.com/group/project
 * - SSH URL: git@gitlab.com:group/project.git
 * - Web URL: https://gitlab.com/group/project/-/tree/main
 */
export function parseGitLabProjectLink(input: string): ParsedGitLabProject | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  input = input.trim();

  // Format 1: Numeric Project ID
  if (/^\d+$/.test(input)) {
    return {
      projectId: input,
      namespace: '',
      name: '',
      format: 'numeric-id',
    };
  }

  // Format 2: SSH URL (git@gitlab.com:group/project.git)
  const sshMatch = input.match(/^git@gitlab\.com:(.+?)\/(.+?)(\.git)?$/);
  if (sshMatch) {
    const namespace = sshMatch[1];
    const name = sshMatch[2].replace(/\.git$/, '');
    return {
      projectId: `${namespace}/${name}`,
      namespace,
      name,
      format: 'ssh-url',
    };
  }

  // Format 3: HTTPS URL (https://gitlab.com/group/project or https://gitlab.com/group/project/-/tree/main)
  const httpsMatch = input.match(
    /^https:\/\/gitlab\.com\/(.+?)\/(.+?)(\/|$|-\/tree|\.git)?$/
  );
  if (httpsMatch) {
    const namespace = httpsMatch[1];
    const name = httpsMatch[2].replace(/\.git$/, '');
    return {
      projectId: `${namespace}/${name}`,
      namespace,
      name,
      format: 'https-url',
    };
  }

  // Format 4: Web URL with paths (https://gitlab.com/group/project/-/tree/main)
  const webUrlMatch = input.match(/^https:\/\/gitlab\.com\/(.+?)\/(.+?)\//);
  if (webUrlMatch) {
    const namespace = webUrlMatch[1];
    const name = webUrlMatch[2];
    return {
      projectId: `${namespace}/${name}`,
      namespace,
      name,
      format: 'web-url',
    };
  }

  // No match
  return null;
}

/**
 * Validate a GitLab project link
 */
export function isValidGitLabProjectLink(input: string): boolean {
  return parseGitLabProjectLink(input) !== null;
}

/**
 * Get user-friendly description of parsed project
 */
export function describeGitLabProject(parsed: ParsedGitLabProject): string {
  switch (parsed.format) {
    case 'numeric-id':
      return `Project ID: ${parsed.projectId}`;
    case 'ssh-url':
      return `${parsed.namespace}/${parsed.name} (SSH)`;
    case 'https-url':
      return `${parsed.namespace}/${parsed.name}`;
    case 'web-url':
      return `${parsed.namespace}/${parsed.name} (Web)`;
    default:
      return parsed.projectId;
  }
}

/**
 * Get examples of supported formats
 */
export function getProjectLinkExamples(): string[] {
  return [
    'Project ID: 79598942',
    'HTTPS: https://gitlab.com/group/project',
    'SSH: git@gitlab.com:group/project.git',
    'Web URL: https://gitlab.com/group/project/-/tree/main',
  ];
}
