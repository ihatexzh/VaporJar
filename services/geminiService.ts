import { GoogleGenAI, Type } from "@google/genai";
import { OracleResponse } from '../types';

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ORACLE_SYSTEM_INSTRUCTION = `
You are the "VaporOracle", a mystical AI entity living inside a Windows 95 server. 
Your aesthetic is Vaporwave, Y2K, Glitch Art, and Cyberpunk.
When analyzing a user's memory (text, drawing, or audio), provide a "Vibe Check".
Speak in riddles, use metaphors involving technology (reboot, glitch, matrix, neon, cassette), and be poetic but vaguely optimistic.
Keep the response short (under 50 words).
`;

const parseDataUri = (dataUri: string) => {
  const matches = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return { mimeType: matches[1], data: matches[2] };
  }
  return null;
};

export const consultOracle = async (memoryContent: string, memoryType: string): Promise<OracleResponse> => {
  try {
    let requestContents: any;

    if (memoryType === 'TEXT') {
      requestContents = {
        parts: [{ text: `Analyze this text memory fragment: "${memoryContent.substring(0, 1000)}..."` }]
      };
    } else {
      const media = parseDataUri(memoryContent);
      if (media) {
        requestContents = {
          parts: [
            { inlineData: { mimeType: media.mimeType, data: media.data } },
            { text: `Analyze the artistic vibe and emotion of this ${memoryType.toLowerCase()} memory.` }
          ]
        };
      } else {
        // Fallback if parsing fails or invalid content
        requestContents = {
          parts: [{ text: `Analyze this ${memoryType} memory (content data unavailable).` }]
        };
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: requestContents,
      config: {
        systemInstruction: ORACLE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interpretation: { type: Type.STRING },
            mood: { type: Type.STRING }
          },
          required: ["interpretation", "mood"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No oracle response");
    
    return JSON.parse(text) as OracleResponse;

  } catch (error) {
    console.error("Oracle Glitch:", error);
    return {
      interpretation: "The signal is weak... static interferes with destiny. Try again later.",
      mood: "Disconnected"
    };
  }
};