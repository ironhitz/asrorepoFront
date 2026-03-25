export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type VulnStatus = 'detected' | 'patching' | 'patched' | 'verified' | 'ignored';
export type AgentStatus = 'idle' | 'busy' | 'error';

export interface DashboardStats {
  riskScore: number;
  criticalCount: number;
  highCount: number;
  mttp: string;
  autoFixedCount: number;
  mediumCount?: number;
  lowCount?: number;
  totalVulns?: number;
  patchedCount?: number;
  activeAgents?: number;
  pipelineHealth?: number;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  lastAction?: string;
  lastActionTime?: string;
  purpose?: string;
  trigger?: string;
  icon?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  score?: number;
  duration?: string;
  artifacts?: string[];
  blocking?: boolean;
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

export interface PipelineJob {
  id: number;
  name: string;
  stage: string;
  status: string;
  started_at: string;
  finished_at: string;
  duration: number;
}

export interface PipelineEvent {
  id: string;
  projectId: string;
  status: string;
  ref: string;
  webUrl: string;
  createdAt: string;
  jobs?: PipelineJob[];
}

export interface SustainabilityMetrics {
  carbonFootprint: number; // in grams CO2e
  energyUsage: number; // in Wh
  greenScore: number; // 0-100
  optimizationSavings: number; // percentage
}

export interface UserTask {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'completed';
  dueDate: string;
}

export interface UserSession {
  id: string;
  timestamp: string;
  duration: string;
  actions: number;
}

export interface ProfileData {
  history: ActivityLog[];
  savedSessions: UserSession[];
  openTasks: UserTask[];
  pendingMRs: any[];
}
