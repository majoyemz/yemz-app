"use client";

import { useState, useRef, useEffect } from "react";
import type { AgentMessage, AgentId } from "@/lib/agents/types";

interface AgentChatProps {
  /** Which tab/agent this chat is for */
  tab: string;
  /** Display name for the agent */
  agentName: string;
  /** Optional placeholder text */
  placeholder?: string;
}

const AGENT_LABELS: Record<AgentId, string> = {
  orchestrator: "Orchestrator",
  growth_agent: "Growth Agent",
  legal_agent: "Legal Agent",
  brand_agent: "Brand Agent",
  industry_agent: "Industry Agent",
  dev_agent: "Dev Agent",
  canvas_agent: "Canvas Agent",
  drive_agent: "Drive Agent",
  tracker_agent: "Tracker Agent",
};

export default function AgentChat({
  tab,
  agentName,
  placeholder = "Ask the agent...",
}: AgentChatProps) {
  const [messages, setMessages] = useState<
    Array<AgentMessage & { agent?: AgentId }>
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(({ role, content }) => ({
        role,
        content,
      }));

      const res = await fetch("/api/orchestrator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          tab,
          conversationHistory,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            agent: data.agent,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${data.error || "Something went wrong."}`,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error: Failed to reach the server.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h2 className="font-serif text-lg font-semibold">{agentName}</h2>
        <p className="text-sm text-gray-500">
          Powered by the Yemz orchestrator
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-gray-400">
              Start a conversation with {agentName}.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-coral text-white"
                  : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
              }`}
            >
              {msg.role === "assistant" && msg.agent && (
                <p className="mb-1 text-xs font-medium text-coral">
                  {AGENT_LABELS[msg.agent] || msg.agent}
                </p>
              )}
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-gray-100 px-4 py-3 dark:bg-gray-800">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-coral [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-coral [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-coral" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 px-6 py-4 dark:border-gray-800"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral dark:border-gray-700 dark:bg-gray-900"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-coral px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-coral/90 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
