"use client";

import { useState } from "react";
import AgentChat from "@/components/portal/AgentChat";

export default function TrackerPage() {
  const [activeView, setActiveView] = useState<"bugs" | "tests" | "chat">("chat");

  return (
    <div className="flex h-full flex-col">
      {/* Header with view tabs */}
      <div className="border-b border-gray-200 px-6 py-3 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <h1 className="font-serif text-xl font-bold">Bug & Test Tracker</h1>
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            {(["chat", "bugs", "tests"] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  activeView === view
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400"
                }`}
              >
                {view === "chat" ? "Agent" : view === "bugs" ? "Bug Board" : "Test Cases"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === "chat" && (
          <AgentChat
            tab="tracker"
            agentName="Tracker Agent"
            placeholder="Log bugs, check test status, generate reports..."
          />
        )}
        {activeView === "bugs" && (
          <div className="p-6">
            <p className="text-sm text-gray-500">
              Bug board will display once connected to Supabase.
              Use the Agent tab to log and query bugs.
            </p>
          </div>
        )}
        {activeView === "tests" && (
          <div className="p-6">
            <p className="text-sm text-gray-500">
              Test cases table will display once connected to Supabase.
              Use the Agent tab to create and track test cases.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
