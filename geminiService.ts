import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { AIModel, ChatMessage } from "./types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set in environment variables.");
    }
    this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || "" });
  }

  async generateResponse(
    model: AIModel,
    messages: ChatMessage[],
    systemInstruction?: string
  ) {
    try {
      const contents = messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      const response = await this.ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      return response;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  async *generateResponseStream(
    model: AIModel,
    messages: ChatMessage[],
    systemInstruction?: string
  ) {
    try {
      const contents = messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      const responseStream = await this.ai.models.generateContentStream({
        model: model,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      for await (const chunk of responseStream) {
        yield chunk;
      }
    } catch (error) {
      console.error("Gemini API Stream Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
