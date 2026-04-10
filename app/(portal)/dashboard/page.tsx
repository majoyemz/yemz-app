import AgentChat from "@/components/portal/AgentChat";

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h1 className="font-serif text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of recent agent activity, pending approvals, and open bugs.
        </p>
      </div>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Quick-action cards */}
        <div className="border-r border-gray-200 p-6 dark:border-gray-800">
          <h2 className="font-serif text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Growth", href: "/growth", icon: "◆" },
              { label: "Legal", href: "/legal", icon: "§" },
              { label: "Brand", href: "/brand", icon: "◈" },
              { label: "Industry", href: "/industry", icon: "◊" },
              { label: "Dev", href: "/dev", icon: "⌘" },
              { label: "Canvas", href: "/canvas", icon: "▣" },
              { label: "Tracker", href: "/tracker", icon: "▥" },
              { label: "Approvals", href: "/approvals", icon: "✓" },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700 transition-colors hover:border-coral hover:text-coral dark:border-gray-700 dark:text-gray-300"
              >
                <span>{action.icon}</span>
                {action.label}
              </a>
            ))}
          </div>
        </div>

        {/* Orchestrator chat */}
        <AgentChat
          tab="dashboard"
          agentName="Orchestrator"
          placeholder="Ask anything — the orchestrator will route to the right agent..."
        />
      </div>
    </div>
  );
}
