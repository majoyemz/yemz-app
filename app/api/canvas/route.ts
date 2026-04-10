import OpenAI from "openai";
import { saveToDrive } from "@/lib/integrations/drive";

const openai = new OpenAI();

export async function POST(req: Request) {
  try {
    const { prompt, size = "1792x1024", quality = "hd" } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: size as "1792x1024" | "1024x1024" | "1024x1792",
      quality: quality as "hd" | "standard",
      n: 1,
    });

    const imageUrl = response.data[0].url!;
    const revisedPrompt = response.data[0].revised_prompt;

    // Auto-save to Drive
    const driveFile = await saveToDrive({
      imageUrl,
      folder: "Brand/Assets",
      filename: `canvas-${Date.now()}.png`,
    });

    return Response.json({ imageUrl, revisedPrompt, driveFile });
  } catch (error) {
    console.error("[canvas] Error:", error);
    return Response.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
