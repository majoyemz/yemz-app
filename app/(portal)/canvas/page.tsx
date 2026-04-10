"use client";

import { useState } from "react";
import AgentChat from "@/components/portal/AgentChat";

export default function CanvasPage() {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const res = await fetch("/api/canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (res.ok) {
        setGeneratedImage(data.imageUrl);
      }
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex h-full">
      {/* Chat side */}
      <div className="flex-1 border-r border-gray-200 dark:border-gray-800">
        <AgentChat
          tab="canvas"
          agentName="Canvas Agent"
          placeholder="Describe the image you want to generate..."
        />
      </div>

      {/* Canvas side */}
      <div className="w-96 flex flex-col p-6">
        <h2 className="font-serif text-lg font-semibold mb-4">
          Image Generation
        </h2>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a DALL-E 3 prompt..."
          className="w-full rounded-lg border border-gray-300 p-3 text-sm h-32 resize-none focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral dark:border-gray-700 dark:bg-gray-900"
        />

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="mt-3 w-full rounded-lg bg-coral py-2.5 text-sm font-medium text-white hover:bg-coral/90 disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Generate Image"}
        </button>

        {generatedImage && (
          <div className="mt-4">
            <img
              src={generatedImage}
              alt="Generated"
              className="w-full rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}
