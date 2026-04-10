import type { AgentId, TabId } from "./types";

/**
 * Route messages to the appropriate sub-agent based on the active tab
 * and message content analysis.
 */

const TAB_TO_AGENT: Record<string, AgentId> = {
  growth: "growth_agent",
  legal: "legal_agent",
  brand: "brand_agent",
  industry: "industry_agent",
  dev: "dev_agent",
  canvas: "canvas_agent",
  drive: "drive_agent",
  tracker: "tracker_agent",
};

/** Keywords that signal routing to a specific agent regardless of tab */
const KEYWORD_ROUTES: { keywords: string[]; agent: AgentId }[] = [
  {
    keywords: ["partner", "outreach", "deal", "pipeline", "onboarding", "revenue"],
    agent: "growth_agent",
  },
  {
    keywords: ["contract", "legal", "compliance", "GDPR", "privacy policy", "T&C", "terms"],
    agent: "legal_agent",
  },
  {
    keywords: ["brand", "copy", "tagline", "campaign", "marketing", "visual identity"],
    agent: "brand_agent",
  },
  {
    keywords: ["restaurant ops", "field note", "operator", "industry insight"],
    agent: "industry_agent",
  },
  {
    keywords: ["bug", "feature", "code", "API", "database", "schema", "component", "deploy"],
    agent: "dev_agent",
  },
  {
    keywords: ["generate image", "DALL-E", "visual asset", "design asset", "canvas"],
    agent: "canvas_agent",
  },
  {
    keywords: ["drive", "document", "file search", "folder"],
    agent: "drive_agent",
  },
  {
    keywords: ["bug report", "test case", "QA", "tracker", "P0", "P1"],
    agent: "tracker_agent",
  },
];

/**
 * Determine which agent should handle a message.
 *
 * Priority:
 * 1. If the user is on a specific tab, route to that tab's agent
 * 2. If keyword analysis matches, route to the matched agent
 * 3. Fall back to orchestrator for cross-domain or ambiguous requests
 */
export function routeToAgent(message: string, tab: TabId | string): AgentId {
  // Direct tab routing (except dashboard which goes to orchestrator)
  if (tab && tab !== "dashboard" && tab !== "approvals" && tab !== "slack") {
    const tabAgent = TAB_TO_AGENT[tab];
    if (tabAgent) return tabAgent;
  }

  // Keyword-based routing for dashboard/cross-domain tabs
  const lowerMessage = message.toLowerCase();
  for (const route of KEYWORD_ROUTES) {
    if (route.keywords.some((kw) => lowerMessage.includes(kw.toLowerCase()))) {
      return route.agent;
    }
  }

  // Default: orchestrator handles it directly
  return "orchestrator";
}
