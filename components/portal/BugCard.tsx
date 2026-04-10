"use client";

import type { BugReport } from "@/lib/agents/types";

interface BugCardProps {
  bug: BugReport;
  onStatusChange?: (id: string, status: BugReport["status"]) => void;
}

const SEVERITY_STYLES: Record<string, string> = {
  P0: "border-red-500 bg-red-50 dark:bg-red-950",
  P1: "border-orange-400 bg-orange-50 dark:bg-orange-950",
  P2: "border-yellow-400 bg-yellow-50 dark:bg-yellow-950",
  P3: "border-gray-300 bg-gray-50 dark:bg-gray-900",
};

const SEVERITY_LABELS: Record<string, string> = {
  P0: "Crash",
  P1: "Broken",
  P2: "Degraded",
  P3: "Cosmetic",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  resolved: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  wont_fix: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export default function BugCard({ bug, onStatusChange }: BugCardProps) {
  return (
    <div className={`rounded-xl border-l-4 p-4 ${SEVERITY_STYLES[bug.severity]}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded bg-gray-900 px-1.5 py-0.5 text-xs font-bold text-white dark:bg-gray-100 dark:text-gray-900">
            {bug.severity}
          </span>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {bug.title}
          </h3>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[bug.status || "open"]}`}
        >
          {(bug.status || "open").replace("_", " ")}
        </span>
      </div>

      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
        <p>
          <strong>Area:</strong> {bug.area}
        </p>
        <p>
          <strong>Expected:</strong> {bug.expected}
        </p>
        <p>
          <strong>Actual:</strong> {bug.actual}
        </p>
      </div>

      {bug.id && onStatusChange && bug.status !== "resolved" && (
        <div className="mt-3 flex gap-2">
          {bug.status === "open" && (
            <button
              onClick={() => onStatusChange(bug.id!, "in_progress")}
              className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
            >
              Start Work
            </button>
          )}
          <button
            onClick={() => onStatusChange(bug.id!, "resolved")}
            className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
          >
            Resolve
          </button>
        </div>
      )}
    </div>
  );
}
