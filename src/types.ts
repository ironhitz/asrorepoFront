export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type VulnStatus = 'detected' | 'patching' | 'patched' | 'verified' | 'ignored';
export type AgentStatus = 'idle' | 'busy' | 'error';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  lastAction?: string;
  lastActionTime?: string;
}

export interface Vulnerability {
  id: string;
  projectId: string;
  title: string;
  severity: Severity;
  status: VulnStatus;
  description: string;
  file?: string;
  line?: number;
  createdAt: string;
  history?: {
    status: VulnStatus;
    timestamp: string;
    message: string;
    agentId?: string;
  }[];
}

export interface GitLabProject {
  id: number;
  name: string;
  path_with_namespace: string;
  avatar_url: string | null;
  web_url?: string;
  firestoreId?: string;
  description?: string;
  star_count?: number;
  forks_count?: number;
  last_activity_at?: string;
  default_branch?: string;
}

export interface Threat {
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  mitigation: string;
}

export interface ThreatModel {
  summary: string;
  threats: Threat[];
  attackVectors: string[];
}

export interface ActivityLog {
  id: string;
  projectId: string;
  timestamp: string;
  agentId?: string;
  type: string;
  message: string;
  details?: any;
}

export interface PipelineEvent {
  id: string;
  projectId: string;
  status: string;
  ref: string;
  webUrl: string;
  createdAt: string;
}

export interface DashboardStats {
  riskScore: number;
  criticalCount: number;
  highCount: number;
  mttp: string; // Mean Time To Patch
  autoFixedCount: number;
}
