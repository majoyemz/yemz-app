import { logBug, getOpenBugs, updateBugStatus, createTestCase } from "@/lib/integrations/tracker";
import type { BugReport, TestCase } from "@/lib/agents/types";

/**
 * GET /api/tracker — List open bugs with optional filters.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const severity = searchParams.get("severity") || undefined;
    const area = searchParams.get("area") || undefined;

    const bugs = await getOpenBugs({ severity, area });
    return Response.json({ bugs });
  } catch (error) {
    console.error("[tracker] GET error:", error);
    return Response.json({ error: "Failed to fetch bugs" }, { status: 500 });
  }
}

/**
 * POST /api/tracker — Log a bug or create a test case.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type } = body as { type: "bug" | "test_case" };

    if (type === "bug") {
      const bug = body as BugReport & { type: string };
      const id = await logBug(bug);
      return Response.json({ id, status: "logged" });
    }

    if (type === "test_case") {
      const testCase = body as TestCase & { type: string };
      const id = await createTestCase(testCase);
      return Response.json({ id, status: "created" });
    }

    return Response.json({ error: "type must be 'bug' or 'test_case'" }, { status: 400 });
  } catch (error) {
    console.error("[tracker] POST error:", error);
    return Response.json({ error: "Failed to log entry" }, { status: 500 });
  }
}

/**
 * PATCH /api/tracker — Update bug status.
 */
export async function PATCH(req: Request) {
  try {
    const { id, status } = (await req.json()) as {
      id: string;
      status: BugReport["status"];
    };

    if (!id || !status) {
      return Response.json(
        { error: "id and status are required" },
        { status: 400 }
      );
    }

    await updateBugStatus(id, status);
    return Response.json({ id, status });
  } catch (error) {
    console.error("[tracker] PATCH error:", error);
    return Response.json({ error: "Failed to update bug" }, { status: 500 });
  }
}
