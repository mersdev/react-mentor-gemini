import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message, RoadmapStep } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(API_KEY);

let currentChatSession: any = null;
let currentContext: string = "";

// Utility function to remove markdown links while keeping the text
function sanitizeLinks(content: string): string {
  // Remove markdown links but keep the text: [text](url) -> text
  const sanitizedContent = content.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Remove plain URLs
  return sanitizedContent.replace(/https?:\/\/[^\s]+/g, "");
}

function cleanJsonResponse(response: string): string {
  // Find the first '[' and last ']' to extract just the JSON array
  const start = response.indexOf("[");
  const end = response.lastIndexOf("]") + 1;
  if (start === -1 || end === 0) return response;

  return response.slice(start, end);
}

export async function resetGeminiChat() {
  try {
    // Reset chat session
    currentChatSession = null;

    // Reset context
    currentContext = "";

    // Initialize a fresh model instance
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    currentChatSession = model.startChat({
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });

    return true;
  } catch (error) {
    console.error("Error resetting Gemini chat:", error);
    throw error;
  }
}

export async function generateResponse(
  message: string,
  previousMessages: Message[] = []
) {
  try {
    if (!currentChatSession) {
      await resetGeminiChat();
    }

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

    const result = await currentChatSession.sendMessage([
      { text: systemPrompt },
    ]);
    return result.response.text();
  } catch (error) {
    console.error("Chat error:", error);
    await resetGeminiChat(); // Reset on error
    throw error;
  }
}

export async function generateRoadmap(messages: Message[]) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Get only the latest message regardless of role
  const latestMessage = messages[messages.length - 1];

  if (!latestMessage) {
    return [];
  }

  const roadmapPrompt = `Based on the following content, create a structured learning roadmap:

Content to analyze:
${latestMessage.content}

Instructions:
1. Create a step-by-step learning path
2. For each step, include:
   - A clear title
   - Key concepts to understand
   - Practical examples or exercises
   - Relevant resources or documentation
3. Format as JSON array with this structure:
[
  {
    "title": "Step Title",
    "descriptions": [
      {
        "concept": "Concept Name",
        "description": "Brief explanation",
        "link": "Documentation or resource URL"
      }
    ]
  }
]`;

  try {
    const result = await model.generateContent([{ text: roadmapPrompt }]);
    const content = result.response.text();

    try {
      // Attempt to parse the entire response first
      return JSON.parse(content);
    } catch {
      // If that fails, try to extract JSON using regex
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    }
  } catch (error) {
    console.error("Roadmap generation error:", error);
    return [];
  }
}

export async function generateNotes(messages: Message[]): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Get the latest conversation context
    const latestMessages = messages.slice(-10); // Get last 10 messages for context

    // Separate and format messages by role
    const formattedMessages = latestMessages.reduce(
      (acc, msg) => {
        const role = msg.role === "assistant" ? "Explanations" : "Questions";
        acc[role] = [...(acc[role] || []), sanitizeLinks(msg.content)];
        return acc;
      },
      { Questions: [], Explanations: [] } as Record<string, string[]>
    );

    const notesPrompt = `As a learning assistant, create comprehensive study notes from our latest conversation.

Context:
Latest Questions:
${formattedMessages.Questions.map((q) => `- ${q}`).join("\n")}

Latest Explanations:
${formattedMessages.Explanations.join("\n\n")}

Instructions:
1. Format the notes in this structure:

# 📚 Study Notes
[Brief introduction about the main topic]

## 🎯 Key Learning Objectives
- [List main learning objectives]

## 📖 Core Concepts
### [Concept 1]
- Detailed explanation
- Examples
- Code snippets (if applicable)

### [Concept 2]
[Similar structure...]

## 💡 Practical Examples
- Real-world applications
- Code demonstrations
- Use cases

## 🔗 Related Concepts
- Connections to other topics
- Prerequisites
- Advanced topics to explore

## 📝 Summary
- Key takeaways
- Main points to remember

Please generate concise, well-organized notes focusing on the latest discussion points.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: notesPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 2048,
      },
    });

    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    return text;
  } catch (error) {
    console.error("Error generating notes:", error);
    throw new Error("Failed to generate notes. Please try again.");
  }
}
