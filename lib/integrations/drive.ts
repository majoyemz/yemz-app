import type { DriveContext, DriveFile, SaveToDriveParams } from "@/lib/agents/types";

/**
 * Map portal tabs to their Google Drive folder scope.
 */
const FOLDER_MAP: Record<string, string> = {
  growth: "Growth",
  legal: "Legal",
  brand: "Brand",
  industry: "Industry",
  dev: "Dev",
  canvas: "Brand/Assets",
  dashboard: "Shared",
  approvals: "Shared",
  slack: "Shared",
};

/**
 * Fetch Drive context relevant to the current message and tab.
 * The actual file retrieval happens via the Google Drive MCP server
 * during the Claude API call. This function prepares the context metadata.
 */
export async function fetchDriveContext(
  message: string,
  tab: string
): Promise<DriveContext> {
  const folder = FOLDER_MAP[tab] || "Shared";

  return {
    folder,
    summary: `Searching /Yemz Drive/${folder}/ for context relevant to: "${message}"`,
    files: [],
  };
}

/**
 * Save a generated asset to Google Drive.
 * Uses the Drive MCP server write tool.
 */
export async function saveToDrive({
  imageUrl,
  folder,
  filename,
}: SaveToDriveParams): Promise<DriveFile> {
  // Implementation via Drive MCP write tool during Claude API call.
  // The MCP server handles the actual file upload.
  // This returns a placeholder — the real response comes from MCP.
  return {
    id: `drive-${Date.now()}`,
    name: filename,
    mimeType: "image/png",
    url: imageUrl,
    summary: `Saved to /Yemz Drive/${folder}/${filename}`,
  };
}
