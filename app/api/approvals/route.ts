import { createClient } from "@supabase/supabase-js";
import { sendApprovalRequest } from "@/lib/integrations/slack";
import type { AgentId } from "@/lib/agents/types";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/approvals — List approvals, optionally filtered by status.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = supabase
      .from("approvals")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return Response.json({ approvals: data });
  } catch (error) {
    console.error("[approvals] GET error:", error);
    return Response.json({ error: "Failed to fetch approvals" }, { status: 500 });
  }
}

/**
 * POST /api/approvals — Create a new approval request.
 */
export async function POST(req: Request) {
  try {
    const { title, summary, output, agent, requestedBy } = (await req.json()) as {
      title: string;
      summary: string;
      output: string;
      agent: AgentId;
      requestedBy?: string;
    };

    if (!title || !output || !agent) {
      return Response.json(
        { error: "title, output, and agent are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("approvals")
      .insert({
        title,
        summary,
        output,
        agent,
        requested_by: requestedBy,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) throw error;

    // Send Slack notification
    await sendApprovalRequest({
      title,
      summary: summary || title,
      agentOutput: output,
      approvalId: data.id,
      agent,
      requestedBy,
    });

    return Response.json({ approvalId: data.id, status: "pending" });
  } catch (error) {
    console.error("[approvals] POST error:", error);
    return Response.json(
      { error: "Failed to create approval" },
      { status: 500 }
    );
  }
}
