-- Yemz Platform — Initial Schema
-- Tables: approvals, bugs, test_cases

-- Approvals table: stores all agent outputs awaiting human review
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  agent TEXT NOT NULL,
  output TEXT NOT NULL,
  summary TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'changes_requested', 'rejected')),
  requested_by TEXT,
  reviewed_by TEXT,
  slack_ts TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bugs table: bug tracking for the Yemz product
CREATE TABLE IF NOT EXISTS bugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  severity TEXT NOT NULL
    CHECK (severity IN ('P0', 'P1', 'P2', 'P3')),
  area TEXT NOT NULL,
  steps_to_reproduce TEXT[],
  expected TEXT,
  actual TEXT,
  status TEXT DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved', 'wont_fix')),
  reported_by TEXT,
  assigned_to TEXT,
  device_env TEXT,
  notes TEXT,
  linked_feature TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Test cases table: QA tracking by feature area
CREATE TABLE IF NOT EXISTS test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_area TEXT NOT NULL,
  description TEXT NOT NULL,
  steps TEXT[],
  expected_result TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pass', 'fail', 'pending')),
  last_run_at TIMESTAMPTZ,
  run_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_approvals_status ON approvals (status);
CREATE INDEX idx_approvals_agent ON approvals (agent);
CREATE INDEX idx_bugs_severity ON bugs (severity);
CREATE INDEX idx_bugs_status ON bugs (status);
CREATE INDEX idx_bugs_area ON bugs (area);
CREATE INDEX idx_test_cases_feature_area ON test_cases (feature_area);
CREATE INDEX idx_test_cases_status ON test_cases (status);
