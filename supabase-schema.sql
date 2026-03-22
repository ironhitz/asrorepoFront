-- Supabase Database Schema for ASRO Dashboard
-- Run this in your Supabase SQL Editor

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  status TEXT DEFAULT 'idle',
  lastAction TEXT,
  userId UUID REFERENCES auth.users(id),
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Create vulnerabilities table
CREATE TABLE IF NOT EXISTS vulnerabilities (
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
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  agentId TEXT,
  projectId TEXT,
  userId UUID REFERENCES auth.users(id),
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- Create pipelines table
CREATE TABLE IF NOT EXISTS pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projectId TEXT,
  pipelineId INTEGER,
  status TEXT,
  ref TEXT,
  sha TEXT,
  webUrl TEXT,
  userId UUID REFERENCES auth.users(id),
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT,
  path_with_namespace TEXT,
  avatar_url TEXT,
  web_url TEXT,
  star_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  addedAt TIMESTAMPTZ DEFAULT NOW(),
  userId UUID REFERENCES auth.users(id),
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Agents
CREATE POLICY "Users can view own agents" ON agents FOR SELECT USING (userId = auth.uid());
CREATE POLICY "Users can insert own agents" ON agents FOR INSERT WITH CHECK (userId = auth.uid());
CREATE POLICY "Users can update own agents" ON agents FOR UPDATE USING (userId = auth.uid());
CREATE POLICY "Users can delete own agents" ON agents FOR DELETE USING (userId = auth.uid());

-- Vulnerabilities
CREATE POLICY "Users can view own vulnerabilities" ON vulnerabilities FOR SELECT USING (userId = auth.uid());
CREATE POLICY "Users can insert own vulnerabilities" ON vulnerabilities FOR INSERT WITH CHECK (userId = auth.uid());
CREATE POLICY "Users can update own vulnerabilities" ON vulnerabilities FOR UPDATE USING (userId = auth.uid());
CREATE POLICY "Users can delete own vulnerabilities" ON vulnerabilities FOR DELETE USING (userId = auth.uid());

-- Activity Logs
CREATE POLICY "Users can view own activity_logs" ON activity_logs FOR SELECT USING (userId = auth.uid());
CREATE POLICY "Users can insert own activity_logs" ON activity_logs FOR INSERT WITH CHECK (userId = auth.uid());

-- Pipelines
CREATE POLICY "Users can view own pipelines" ON pipelines FOR SELECT USING (userId = auth.uid());
CREATE POLICY "Users can insert own pipelines" ON pipelines FOR INSERT WITH CHECK (userId = auth.uid());
CREATE POLICY "Users can update own pipelines" ON pipelines FOR UPDATE USING (userId = auth.uid());

-- Projects
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (userId = auth.uid());
CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (userId = auth.uid());
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (userId = auth.uid());
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (userId = auth.uid());
