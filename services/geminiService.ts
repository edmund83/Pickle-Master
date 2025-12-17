import { GoogleGenAI, Type } from "@google/genai";

// Guideline: Create a new GoogleGenAI instance right before making an API call 
// to ensure it always uses the most up-to-date API key.

export const analyzeInventory = async (items: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are an expert Warehouse Consultant. Analyze this Pickle-style inventory data and provide top 3 high-impact insights. Focus on: 
    1. Low stock alerts based on minimum thresholds.
    2. Suggested item movements between folders for efficiency.
    3. Aging stock that hasn't moved.
    Data: ${JSON.stringify(items)}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            severity: { type: Type.STRING, description: 'low, medium, high' }
          },
          required: ['title', 'description', 'severity']
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const inventoryChat = async (query: string, context: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `You are a helpful AI Warehouse Assistant in a Pickle-style management system.
    Current context (Items/Folders): ${JSON.stringify(context)}. 
    User is asking about stock levels, locations, or movements. Be concise and professional.
    User Query: ${query}`,
  });
  return response.text;
};

// Fix: Removed responseMimeType as it's not supported for gemini-2.5-flash-image (nano banana series)
export const scanLabel = async (base64Image: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: "Extract the product name, SKU, price, and quantity from this packing slip or barcode label. Return as JSON with keys: productName, sku, quantity, price. Return only the raw JSON string." }
      ]
    }
  });
  
  const text = response.text || '{}';
  try {
    // Strip markdown formatting if present
    const cleanedText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to parse label scan result", error);
    return {};
  }
};