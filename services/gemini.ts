import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Ensure API key is available
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Chat with Gemini (Text only or Text + Search)
 */
export const chatWithGemini = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  useSearch: boolean = false
): Promise<{ text: string; groundingUrls: Array<{ uri: string; title: string }> }> => {
  try {
    const modelId = 'gemini-2.5-flash';
    
    // Construct the chat object
    // Note: The SDK's chat history format is slightly different from our internal state, so we map it if needed.
    // However, for simplicity and statelessness in this demo helper, we'll use generateContent with system instruction or simple history if using chat object.
    // Let's use the chat object for multi-turn.
    
    const chat = ai.chats.create({
      model: modelId,
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      })),
      config: {
        tools: useSearch ? [{ googleSearch: {} }] : [],
      }
    });

    const result = await chat.sendMessage({ message });
    const response = result as GenerateContentResponse; // Type assertion for clarity

    const text = response.text || "No response text generated.";
    
    // Extract grounding URLs if available
    const groundingUrls: Array<{ uri: string; title: string }> = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          groundingUrls.push({
            uri: chunk.web.uri,
            title: chunk.web.title
          });
        }
      });
    }

    return { text, groundingUrls };

  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};

/**
 * Analyze an image with Gemini
 */
export const analyzeImageWithGemini = async (
  prompt: string,
  imageBase64: string,
  mimeType: string
): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    return response.text || "Could not analyze the image.";
  } catch (error) {
    console.error("Vision Error:", error);
    throw error;
  }
};

/**
 * Generate an image using Gemini
 */
export const generateImageWithGemini = async (
  prompt: string
): Promise<string> => {
  try {
    // Using the 2.5-flash-image model as per instructions for general image generation
    const modelId = 'gemini-2.5-flash-image';

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};
