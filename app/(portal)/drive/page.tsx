import AgentChat from "@/components/portal/AgentChat";
import DrivePanel from "@/components/portal/DrivePanel";

export default function DrivePage() {
  return (
    <div className="flex h-full">
      <div className="flex-1">
        <AgentChat
          tab="drive"
          agentName="Drive Agent"
          placeholder="Search for documents, summarize files, organize folders..."
        />
      </div>
      <DrivePanel folder="Shared" />
    </div>
  );
}
