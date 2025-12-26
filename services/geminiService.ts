
import { GoogleGenAI, Type } from "@google/genai";
import { PersonaResponse } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generatePersona(name: string): Promise<PersonaResponse> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `分析名字 "${name}" 的性格与气质，为它挑选 2 到 3 种匹配的渐变色（以十六进制代码形式），并生成一句能够触动人心、契合这个名字独特韵味的座右铭或优美语句。请使用中文。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            colors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 hex color codes for a gradient",
            },
            quote: {
              type: Type.STRING,
              description: "A poetic sentence fitting the name",
            },
            mood: {
              type: Type.STRING,
              description: "A one or two word mood or personality trait (e.g. 灵动, 深邃)",
            },
          },
          required: ["colors", "quote", "mood"],
        },
      },
    });

    try {
      const result = JSON.parse(response.text || '{}');
      return result as PersonaResponse;
    } catch (error) {
      console.error("Failed to parse Gemini response", error);
      throw new Error("AI 响应解析失败");
    }
  }
}

export const geminiService = new GeminiService();
