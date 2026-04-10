export default function SlackPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h1 className="font-serif text-2xl font-bold">Slack Activity Log</h1>
        <p className="mt-1 text-sm text-gray-500">
          View messages sent to Slack channels by agents.
        </p>
      </div>

      <div className="flex-1 p-6">
        <div className="space-y-4">
          {[
            { channel: "#agent-log", desc: "All agent completions with summary + output link" },
            { channel: "#approvals", desc: "Approval requests with approve/reject buttons" },
            { channel: "#dev-alerts", desc: "Bug alerts from Tracker agent (P0s, P1 thresholds)" },
            { channel: "#growth", desc: "Partner outreach approvals and deal updates" },
            { channel: "#brand", desc: "Asset generation completions, campaign approvals" },
          ].map((ch) => (
            <div
              key={ch.channel}
              className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
            >
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                {ch.channel}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{ch.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Slack activity streams will be available once the Slack MCP server is connected.
        </p>
      </div>
    </div>
  );
}
