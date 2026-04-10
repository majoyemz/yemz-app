"use client";

import { useState } from "react";
import type { DriveFile } from "@/lib/agents/types";

interface DrivePanelProps {
  files?: DriveFile[];
  folder?: string;
}

export default function DrivePanel({ files = [], folder = "Shared" }: DrivePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`border-l border-gray-200 bg-gray-50 transition-all dark:border-gray-800 dark:bg-gray-900 ${
        isCollapsed ? "w-12" : "w-72"
      }`}
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        {!isCollapsed && (
          <div>
            <h3 className="text-sm font-semibold">Drive Context</h3>
            <p className="text-xs text-gray-500">/Yemz Drive/{folder}/</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label={isCollapsed ? "Expand drive panel" : "Collapse drive panel"}
        >
          {isCollapsed ? "▶" : "◀"}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-4">
          {files.length === 0 ? (
            <p className="text-xs text-gray-400">
              No documents loaded. Files are automatically fetched when you
              interact with an agent.
            </p>
          ) : (
            <ul className="space-y-2">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {file.mimeType}
                  </p>
                  {file.summary && (
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {file.summary}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </aside>
  );
}
