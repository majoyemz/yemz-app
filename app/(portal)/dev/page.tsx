import AgentChat from "@/components/portal/AgentChat";

export default function DevPage() {
  return (
    <AgentChat
      tab="dev"
      agentName="Dev & Product Agent"
      placeholder="Features, bugs, code, architecture, PRs..."
    />
  );
}
