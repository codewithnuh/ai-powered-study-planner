import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";

const groq = createGroq({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { section, input } = body;

    // Validate input
    if (
      !section ||
      typeof section !== "string" ||
      !input ||
      typeof input !== "object"
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid 'section' or 'input' field" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Dynamic prompt generation
    const prompts = {
      summary: `Generate a professional summary for the following details: ${JSON.stringify(
        input
      )}`,
      experience: `Write concise bullet points for this job experience: ${JSON.stringify(
        input
      )}`,
      education: `Summarize this education history: ${JSON.stringify(input)}`,
    };

    const prompt =
      prompts[section] ||
      "Please specify a valid section (e.g., summary, experience, education).";

    // Generate content
    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      system: "You are a helpful assistant for resume building.",
      prompt,
      maxTokens: 150,
    });

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error generating text:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
