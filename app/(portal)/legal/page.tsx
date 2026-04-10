import AgentChat from "@/components/portal/AgentChat";

export default function LegalPage() {
  return (
    <AgentChat
      tab="legal"
      agentName="Legal Agent"
      placeholder="Contracts, compliance, T&Cs, privacy..."
    />
  );
}
