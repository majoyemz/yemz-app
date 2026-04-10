import type { ApprovalRequest } from "@/lib/agents/types";

/**
 * Slack channel definitions for the Yemz platform.
 */
export const SLACK_CHANNELS = {
  agentLog: "#agent-log",
  approvals: "#approvals",
  devAlerts: "#dev-alerts",
  growth: "#growth",
  brand: "#brand",
} as const;

interface SlackBlock {
  type: string;
  text?: { type: string; text: string };
  elements?: Array<{
    type: string;
    text: { type: string; text: string };
    style?: string;
    action_id: string;
    value: string;
  }>;
}

/**
 * Post a message to a Slack channel.
 * Requires SLACK_BOT_TOKEN in environment.
 */
export async function postToSlack(
  channel: string,
  message: string,
  blocks?: SlackBlock[]
): Promise<void> {
  const { WebClient } = await import("@slack/web-api");
  const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

  await slack.chat.postMessage({
    channel,
    text: message,
    blocks,
  });
}

/**
 * Send an approval request to the #approvals channel with approve/reject buttons.
 */
export async function sendApprovalRequest({
  title,
  summary,
  approvalId,
}: ApprovalRequest): Promise<void> {
  await postToSlack(`Approval needed: ${title}`, SLACK_CHANNELS.approvals, [
    {
      type: "section",
      text: { type: "mrkdwn", text: `*${title}*\n${summary}` },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Approve" },
          style: "primary",
          action_id: "approve",
          value: approvalId,
        },
        {
          type: "button",
          text: { type: "plain_text", text: "Request changes" },
          style: "danger",
          action_id: "reject",
          value: approvalId,
        },
      ],
    },
  ]);
}

/**
 * Post a bug alert to #dev-alerts.
 */
export async function postBugAlert(
  title: string,
  severity: string,
  area: string
): Promise<void> {
  await postToSlack(
    SLACK_CHANNELS.devAlerts,
    `🚨 *${severity} Bug Alert*: ${title}\nArea: ${area}`
  );
}
