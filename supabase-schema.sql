-- Supabase Database Schema for ASRO Dashboard
-- Run this in your Supabase SQL Editor

-- Clean existing tables (if any)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS vulnerabilities CASCADE;
DROP TABLE IF EXISTS pipelines CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create agents table
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  status TEXT DEFAULT 'idle',
  lastAction TEXT,
  userId UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vulnerabilities table
CREATE TABLE vulnerabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'detected',
  file TEXT,
  projectId TEXT,
  userId UUID REFERENCES auth.users(id),
  history JSONB DEFAULT '[]',
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  agentId TEXT,
  projectId TEXT,
  userId UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pipelines table
CREATE TABLE pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projectId TEXT,
  pipelineId INTEGER,
  status TEXT,
  ref TEXT,
  sha TEXT,
  webUrl TEXT,
  userId UUID REFERENCES auth.users(id),
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT,
  path_with_namespace TEXT,
  avatar_url TEXT,
  web_url TEXT,
  star_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  addedAt TIMESTAMPTZ DEFAULT NOW(),
  added_by TEXT,
  userId UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_vulnerabilities_project ON vulnerabilities(projectId);
CREATE INDEX idx_vulnerabilities_severity ON vulnerabilities(severity);
CREATE INDEX idx_activity_logs_project ON activity_logs(projectId);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX idx_pipelines_project ON pipelines(projectId);
CREATE INDEX idx_agents_user ON agents(userId);

-- RLS Policies

-- Agents: Users can only see their own agents
CREATE POLICY "Users can view own agents" ON agents
  FOR SELECT USING (userId = auth.uid());

CREATE POLICY "Users can insert own agents" ON agents
  FOR INSERT WITH CHECK (userId = auth.uid());

CREATE POLICY "Users can update own agents" ON agents
  FOR UPDATE USING (userId = auth.uid());

CREATE POLICY "Users can delete own agents" ON agents
  FOR DELETE USING (userId = auth.uid());

-- Vulnerabilities: Users can only see their own vulnerabilities
CREATE POLICY "Users can view own vulnerabilities" ON vulnerabilities
  FOR SELECT USING (userId = auth.uid());

CREATE POLICY "Users can insert own vulnerabilities" ON vulnerabilities
  FOR INSERT WITH CHECK (userId = auth.uid());

CREATE POLICY "Users can update own vulnerabilities" ON vulnerabilities
  FOR UPDATE USING (userId = auth.uid());

CREATE POLICY "Users can delete own vulnerabilities" ON vulnerabilities
  FOR DELETE USING (userId = auth.uid());

-- Activity Logs: Users can only see their own logs
CREATE POLICY "Users can view own activity_logs" ON activity_logs
  FOR SELECT USING (userId = auth.uid());

CREATE POLICY "Users can insert own activity_logs" ON activity_logs
  FOR INSERT WITH CHECK (userId = auth.uid());

-- Pipelines: Users can only see their own pipelines
CREATE POLICY "Users can view own pipelines" ON pipelines
  FOR SELECT USING (userId = auth.uid());

CREATE POLICY "Users can insert own pipelines" ON pipelines
  FOR INSERT WITH CHECK (userId = auth.uid());

CREATE POLICY "Users can update own pipelines" ON pipelines
  FOR UPDATE USING (userId = auth.uid());

-- Projects: Users can only see their own projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (userId = auth.uid());

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (userId = auth.uid());

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (userId = auth.uid());

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (userId = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vulnerabilities_updated_at BEFORE UPDATE ON vulnerabilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pipelines_updated_at BEFORE UPDATE ON pipelines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
