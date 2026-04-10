import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Slack webhook handler for interactive components (approve/reject buttons).
 */
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const payload = JSON.parse(params.get("payload") || "{}");

    // Verify Slack signature in production
    // const signature = req.headers.get("x-slack-signature");
    // const timestamp = req.headers.get("x-slack-request-timestamp");

    if (payload.type === "block_actions") {
      const action = payload.actions?.[0];
      if (!action) {
        return Response.json({ error: "No action found" }, { status: 400 });
      }

      const approvalId = action.value;
      const actionId = action.action_id;
      const user = payload.user?.name || "unknown";

      if (actionId === "approve") {
        await supabase
          .from("approvals")
          .update({
            status: "approved",
            reviewed_by: user,
            updated_at: new Date().toISOString(),
          })
          .eq("id", approvalId);

        return Response.json({
          response_type: "in_channel",
          text: `Approved by ${user}`,
        });
      }

      if (actionId === "reject") {
        await supabase
          .from("approvals")
          .update({
            status: "changes_requested",
            reviewed_by: user,
            updated_at: new Date().toISOString(),
          })
          .eq("id", approvalId);

        return Response.json({
          response_type: "in_channel",
          text: `Changes requested by ${user}`,
        });
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("[slack webhook] Error:", error);
    return Response.json({ error: "Webhook error" }, { status: 500 });
  }
}
