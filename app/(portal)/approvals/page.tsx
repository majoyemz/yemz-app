"use client";

import { useState, useEffect } from "react";
import ApprovalCard from "@/components/portal/ApprovalCard";

interface Approval {
  id: string;
  title: string;
  summary: string;
  agent: string;
  status: "pending" | "approved" | "changes_requested" | "rejected";
  requested_by?: string;
  reviewed_by?: string;
  created_at: string;
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [filter, setFilter] = useState<string>("pending");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApprovals();
  }, [filter]);

  async function fetchApprovals() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/approvals?status=${filter}`);
      const data = await res.json();
      setApprovals(data.approvals || []);
    } catch {
      setApprovals([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAction(id: string, action: "approve" | "reject") {
    await fetch("/api/approvals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status: action === "approve" ? "approved" : "changes_requested",
      }),
    });
    fetchApprovals();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h1 className="font-serif text-2xl font-bold">Approval Queue</h1>
        <div className="mt-3 flex gap-2">
          {["pending", "approved", "changes_requested"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === status
                  ? "bg-coral text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : approvals.length === 0 ? (
          <p className="text-sm text-gray-500">
            No {filter.replace("_", " ")} approvals.
          </p>
        ) : (
          <div className="space-y-4">
            {approvals.map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                onApprove={(id) => handleAction(id, "approve")}
                onReject={(id) => handleAction(id, "reject")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
