import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message, RoadmapStep } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateResponse(
  message: string,
  previousMessages: Message[] = []
) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Create a context summary from previous messages
  const contextSummary = previousMessages
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n");

  // Create a structured prompt that includes context and instructions
  const systemPrompt = `You are an intelligent AI learning assistant. Your goal is to help users learn and understand concepts clearly.

Context of conversation:
${contextSummary}

Current user message: ${message}

Instructions:
1. Analyze the conversation context thoroughly
2. Ensure your response is directly relevant to the current topic
3. If the user's question seems unclear, ask for clarification
4. Provide concrete examples when explaining concepts
5. Use markdown formatting for better readability
6. Keep explanations concise but comprehensive
7. If discussing code, include practical examples
8. Reference previous parts of the conversation when relevant

Please provide your response in a clear, structured format.`;

  try {
    const chat = model.startChat({
      history: previousMessages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });

    const result = await chat.sendMessage([{ text: systemPrompt }]);
    return result.response.text();
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
}

export async function generateRoadmap(
  context: string,
  previousMessages: Message[] = []
): Promise<RoadmapStep[] | null> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Extract key topics and concepts from chat history
  const chatTopics = previousMessages
    .map((msg) => msg.content)
    .join(" ")
    .toLowerCase();

  // Create a more focused prompt for roadmap generation
  const roadmapPrompt = `Based on the following conversation context and current topic, create a detailed learning roadmap.

Chat History Context:
${chatTopics}

Current Focus Topic:
${context}

Instructions:
1. Analyze the entire conversation to understand the user's learning goals
2. Create a progressive learning path that builds upon discussed concepts
3. Include practical resources and examples
4. Ensure each step is actionable and measurable
5. Link concepts to previously discussed topics where relevant

Generate a structured learning roadmap as a JSON array with the following format:
[
  {
    "title": "Step Title (make it descriptive and action-oriented)",
    "descriptions": [
      {
        "concept": "Specific Topic or Skill",
        "description": "Clear, practical explanation with concrete steps",
        "link": "Relevant learning resource URL",
        "prerequisite": "Any prerequisite knowledge needed",
        "estimatedTime": "Estimated time to complete this step"
      }
    ]
  }
]

Ensure the response is valid JSON and includes 3-5 main sections with their respective descriptions.
Each section should build upon the previous one and directly relate to the conversation context.`;

  try {
    const result = await model.generateContent([
      {
        text: roadmapPrompt,
      },
    ]);

    const text = result.response.text();
    try {
      const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
      const roadmap = JSON.parse(cleanedText);

      // Validate roadmap structure and relevance
      if (!Array.isArray(roadmap) || roadmap.length === 0) {
        throw new Error("Invalid roadmap structure");
      }

      // Ensure each step has required fields
      const validatedRoadmap = roadmap.map((step: any) => ({
        title: step.title,
        descriptions: Array.isArray(step.descriptions)
          ? step.descriptions.map((desc: any) => ({
              concept: desc.concept || "",
              description: desc.description || "",
              link: desc.link || "",
              prerequisite: desc.prerequisite || "",
              estimatedTime: desc.estimatedTime || "",
            }))
          : [],
      }));

      return validatedRoadmap;
    } catch (jsonError) {
      console.error("Roadmap parsing error:", jsonError);
      return null;
    }
  } catch (error) {
    console.error("Roadmap generation error:", error);
    return null;
  }
}
