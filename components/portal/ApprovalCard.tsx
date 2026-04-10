"use client";

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

interface ApprovalCardProps {
  approval: Approval;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950",
  approved: "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950",
  changes_requested: "border-coral bg-red-50 dark:border-red-800 dark:bg-red-950",
  rejected: "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  changes_requested: "Changes Requested",
  rejected: "Rejected",
};

export default function ApprovalCard({
  approval,
  onApprove,
  onReject,
}: ApprovalCardProps) {
  return (
    <div
      className={`rounded-xl border-2 p-4 ${STATUS_STYLES[approval.status] || ""}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {approval.title}
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {approval.summary}
          </p>
        </div>
        <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium dark:bg-gray-700">
          {approval.agent.replace("_", " ")}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
        <span>
          Status:{" "}
          <strong>{STATUS_LABELS[approval.status]}</strong>
        </span>
        {approval.requested_by && <span>By: {approval.requested_by}</span>}
        <span>{new Date(approval.created_at).toLocaleDateString()}</span>
      </div>

      {approval.status === "pending" && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onApprove?.(approval.id)}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
          >
            Approve
          </button>
          <button
            onClick={() => onReject?.(approval.id)}
            className="rounded-lg bg-coral px-3 py-1.5 text-xs font-medium text-white hover:bg-coral/90"
          >
            Request Changes
          </button>
        </div>
      )}
    </div>
  );
}
