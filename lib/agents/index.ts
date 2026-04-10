/**
 * Agent system barrel export.
 * Import agents and utilities from this file.
 */

export { routeToAgent } from "./router";
export { buildSystemPrompt, ORCHESTRATOR_SYSTEM_PROMPT } from "./orchestrator";
export { GROWTH_AGENT_SYSTEM_PROMPT } from "./growth-agent";
export { LEGAL_AGENT_SYSTEM_PROMPT } from "./legal-agent";
export { BRAND_AGENT_SYSTEM_PROMPT } from "./brand-agent";
export { INDUSTRY_AGENT_SYSTEM_PROMPT } from "./industry-agent";
export { DEV_AGENT_SYSTEM_PROMPT } from "./dev-agent";
export { CANVAS_AGENT_SYSTEM_PROMPT } from "./canvas-agent";
export { DRIVE_AGENT_SYSTEM_PROMPT } from "./drive-agent";
export { TRACKER_AGENT_SYSTEM_PROMPT } from "./tracker-agent";

export type {
  AgentId,
  TabId,
  AgentMessage,
  AgentResponse,
  DriveContext,
  DriveFile,
  ApprovalRequest,
  BugReport,
  TestCase,
  SaveToDriveParams,
} from "./types";
