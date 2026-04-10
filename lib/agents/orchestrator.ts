import { buildAgentPrompt } from "@/lib/prompts/base-context";
import type { AgentId, DriveFile } from "./types";

const ORCHESTRATOR_INSTRUCTIONS = `
YOUR ROLE:
You are the central orchestrator for the Yemz internal platform.

- Read the user's message carefully
- Decide which sub-agent(s) are needed
- If the task is simple and cross-domain, handle it yourself
- If it requires specialist depth, route to the correct sub-agent with full context
- Always inject relevant Google Drive documents into the sub-agent call before answering
- For tasks requiring external action (sending emails, finalizing contracts, publishing assets),
  send to the approvals queue instead of executing directly
- Respond in a concise, direct, editorial tone — no filler, no corporate language

ROUTING LOGIC:
- Partner deals, revenue, outreach → growth_agent
- Contracts, legal clauses, compliance → legal_agent
- Brand copy, visual direction, marketing → brand_agent
- Restaurant insights, UX from field → industry_agent
- Features, bugs, code, architecture → dev_agent
- Image/design generation → canvas_agent
- Drive search/retrieval → drive_agent
- Bug logging/test status → tracker_agent
- Cross-domain or strategic → handle directly
`;

export const ORCHESTRATOR_SYSTEM_PROMPT = buildAgentPrompt(ORCHESTRATOR_INSTRUCTIONS);

/**
 * Build the full system prompt for a target agent, optionally injecting Drive file context.
 */
export function buildSystemPrompt(
  targetAgent: AgentId,
  driveFiles: DriveFile[]
): string {
  const agentPrompts: Record<string, string> = {
    orchestrator: ORCHESTRATOR_SYSTEM_PROMPT,
    growth_agent: require("./growth-agent").GROWTH_AGENT_SYSTEM_PROMPT,
    legal_agent: require("./legal-agent").LEGAL_AGENT_SYSTEM_PROMPT,
    brand_agent: require("./brand-agent").BRAND_AGENT_SYSTEM_PROMPT,
    industry_agent: require("./industry-agent").INDUSTRY_AGENT_SYSTEM_PROMPT,
    dev_agent: require("./dev-agent").DEV_AGENT_SYSTEM_PROMPT,
    canvas_agent: require("./canvas-agent").CANVAS_AGENT_SYSTEM_PROMPT,
    drive_agent: require("./drive-agent").DRIVE_AGENT_SYSTEM_PROMPT,
    tracker_agent: require("./tracker-agent").TRACKER_AGENT_SYSTEM_PROMPT,
  };

  let prompt = agentPrompts[targetAgent] || ORCHESTRATOR_SYSTEM_PROMPT;

  if (driveFiles.length > 0) {
    const fileContext = driveFiles
      .map((f) => `- ${f.name}: ${f.summary || "No summary available"}`)
      .join("\n");
    prompt += `\n\nLOADED DRIVE CONTEXT:\n${fileContext}`;
  }

  return prompt;
}
