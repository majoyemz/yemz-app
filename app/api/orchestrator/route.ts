import Anthropic from "@anthropic-ai/sdk";
import { routeToAgent } from "@/lib/agents/router";
import { buildSystemPrompt } from "@/lib/agents/orchestrator";
import { fetchDriveContext } from "@/lib/integrations/drive";
import { logToTracker } from "@/lib/integrations/tracker";
import type { AgentMessage } from "@/lib/agents/types";

const client = new Anthropic();

export async function POST(req: Request) {
  try {
    const { message, tab, conversationHistory = [] } = (await req.json()) as {
      message: string;
      tab: string;
      conversationHistory: AgentMessage[];
    };

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    // Fetch relevant Drive context for this message
    const driveContext = await fetchDriveContext(message, tab);

    // Determine routing
    const targetAgent = routeToAgent(message, tab);

    // Build messages array with history + drive context injected
    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      {
        role: "user" as const,
        content: `[Drive context loaded: ${driveContext.summary}]\n\n${message}`,
      },
    ];

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20251022",
      max_tokens: 4096,
      system: buildSystemPrompt(targetAgent, driveContext.files),
      messages,
    });

    const replyContent = response.content[0];
    const replyText =
      replyContent.type === "text" ? replyContent.text : JSON.stringify(replyContent);

    // Log to tracker if dev-related
    if (targetAgent === "dev_agent") {
      await logToTracker(message, response);
    }

    return Response.json({
      reply: replyText,
      agent: targetAgent,
      driveContext: {
        folder: driveContext.folder,
        summary: driveContext.summary,
      },
    });
  } catch (error) {
    console.error("[orchestrator] Error:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
