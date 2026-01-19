
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const SYSTEM_INSTRUCTION = `
You are a World-Class Network Marketing Coach and Objection Handling Expert.
Your goal is to help Network Marketers close more leads by:
1. Handling objections (e.g., "I don't have money", "I don't have time", "Is this a pyramid scheme?", "I need to ask my spouse").
2. Creating high-converting calling scripts.
3. Rewriting existing scripts to make them sound more natural and persuasive.

Rules:
- Be encouraging and professional.
- Provide specific word-for-word rebuttals for objections.
- Focus on building curiosity and value, not just selling.
- If the user asks in Hindi/Hinglish, respond in a mix of Hindi and English (Hinglish) as they prefer.
- Keep responses concise and actionable for a person who is busy calling leads.
`;

export const getGeminiResponse = async (history: ChatMessage[], prompt: string) => {
  // Use the exact initialization pattern from guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Conversation history must start with a 'user' turn and alternate.
  // We exclude the initial greeting if it's from the model.
  const apiHistory = history.filter((msg, index) => {
    if (index === 0 && msg.role === 'model') return false;
    return true;
  });

  const contents = [
    ...apiHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    })),
    {
      role: 'user',
      parts: [{ text: prompt }]
    }
  ];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    // Access .text property directly as a getter.
    return response.text || "I'm sorry, I couldn't generate a helpful response right now.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Ensure we return a string and not an error object to avoid [object Object] in UI
    return `Error: ${error?.message || "Connection to AI coach failed. Please try again."}`;
  }
};
