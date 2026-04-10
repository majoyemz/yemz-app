/**
 * Shared types for the Yemz multi-agent system.
 */

export type AgentId =
  | "orchestrator"
  | "growth_agent"
  | "legal_agent"
  | "brand_agent"
  | "industry_agent"
  | "dev_agent"
  | "canvas_agent"
  | "drive_agent"
  | "tracker_agent";

export type TabId =
  | "dashboard"
  | "growth"
  | "legal"
  | "brand"
  | "industry"
  | "dev"
  | "canvas"
  | "drive"
  | "tracker"
  | "approvals"
  | "slack";

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AgentResponse {
  reply: string;
  agent: AgentId;
  driveContext?: DriveContext;
}

export interface DriveContext {
  folder: string;
  summary: string;
  files: DriveFile[];
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  url?: string;
  summary?: string;
}

export interface ApprovalRequest {
  title: string;
  summary: string;
  agentOutput: string;
  approvalId: string;
  agent: AgentId;
  requestedBy?: string;
}

export interface BugReport {
  id?: string;
  title: string;
  severity: "P0" | "P1" | "P2" | "P3";
  area: string;
  stepsToReproduce: string[];
  expected: string;
  actual: string;
  deviceEnv?: string;
  notes?: string;
  status?: "open" | "in_progress" | "resolved" | "wont_fix";
  reportedBy?: string;
  assignedTo?: string;
  linkedFeature?: string;
}

export interface TestCase {
  id?: string;
  featureArea: string;
  description: string;
  steps: string[];
  expectedResult: string;
  status: "pass" | "fail" | "pending";
  lastRunAt?: string;
  runBy?: string;
  notes?: string;
}

export interface SaveToDriveParams {
  imageUrl: string;
  folder: string;
  filename: string;
}
