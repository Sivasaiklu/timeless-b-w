
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  /**
   * Processes an image based on a text prompt using Gemini 2.5 Flash Image.
   */
  async editImage(base64Data: string, prompt: string): Promise<string> {
    try {
      // Extract pure base64 data if it contains the data:image prefix
      const base64Content = base64Data.includes(',') 
        ? base64Data.split(',')[1] 
        : base64Data;

      // Extract mime type if present
      const mimeTypeMatch = base64Data.match(/^data:(image\/[a-zA-Z]+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';

      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Content,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      // Find the image part in the response candidates
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("No response generated from the model.");
      }

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Result = part.inlineData.data;
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${base64Result}`;
        }
      }

      throw new Error("The model did not return an edited image part.");
    } catch (error: any) {
      console.error("Gemini Edit Error:", error);
      throw new Error(error.message || "Failed to process image with AI.");
    }
  }
}

export const geminiService = new GeminiService();
