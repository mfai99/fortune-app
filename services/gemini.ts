import { GoogleGenAI, Modality } from "@google/genai";

// --- CONFIGURATION ---
const USE_BACKEND_PROXY = false; 
const FALLBACK_KEY = "AIzaSyD6DI7fiQGBbFJjYhhWk0x62o-gJd9uqsc"; 
const API_KEY = process.env.API_KEY || FALLBACK_KEY;
const DEEPSEEK_KEY = "sk-9e41f40056714897b6d6e403c0c2cfae"; 

// Initialize AI safely
let ai: any = null;
try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} catch (e) {
    console.error("Failed to init GoogleGenAI", e);
}

// --- DATABASES ---
export const DEITY_SYMBOLS: Record<string, string> = {
    'mazu': 'Sea Guardian Goddess, wearing ornate Red Robe and Phoenix Crown, cute chibi style',
    '媽祖': 'Sea Guardian Goddess, wearing ornate Red Robe and Phoenix Crown, cute chibi style',
    'guanyin': 'White-robed Goddess of Mercy, holding a willow branch, standing on a lotus, cute chibi style',
    '觀音': 'White-robed Goddess of Mercy, holding a willow branch, standing on a lotus, cute chibi style',
    // ... add more if needed
};

// --- MOCK FALLBACK IMAGES ---
const STOCK_IMAGES = {
    'default': 'https://cdn.pixabay.com/photo/2023/01/28/17/53/buddha-7751469_1280.jpg', 
    'gold': 'https://cdn.pixabay.com/photo/2020/04/08/19/05/buddha-5018536_1280.jpg'
};

const MICRO_ITEM_PROMPTS: Record<string, string> = {
    'lucky_sign': "Generate a 'Lucky Sign' (今日好運籤). Output: 4-line poem + 1 actionable advice. Lang: {{lang}}.",
    // ... add others if needed, fallback handles missing keys
};

// --- API CALLERS ---

async function callDeepSeek(prompt: string): Promise<string> {
    try {
        const response = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${DEEPSEEK_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "You are a wise Taoist Master." },
                    { role: "user", content: prompt }
                ],
                stream: false
            })
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "Blessings (API Limit)";
    } catch (e) {
        console.error("DeepSeek Error:", e);
        return await callGeminiText(prompt); // Fallback
    }
}

async function callGeminiText(prompt: string) {
    if (!ai) return "AI Service Unavailable";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.text || "Blessings to you.";
    } catch (e) {
        return "The heavens are silent (Network Error).";
    }
}

async function callGemini(model: string, contents: any, config?: any) {
    if (!ai) throw new Error("AI not initialized");
    try {
        const response = await ai.models.generateContent({
            model,
            contents,
            config: { ...config } 
        });
        const textContent = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return {
            text: textContent,
            candidates: response.candidates,
            raw: response
        };
    } catch (e) {
        console.error("Gemini API Error:", e);
        throw e;
    }
}

// --- EXPORTED FUNCTIONS ---

export async function generateFortuneAnalysis(signTitle: string, language: string): Promise<string> {
  const prompt = `Analyze fortune: ${signTitle}. Lang: ${language}.`;
  return await callDeepSeek(prompt);
}

export async function generateBlessingPoem(name: string, type: string, language: string): Promise<string> {
  const prompt = `Write a blessing poem for ${name}. Type: ${type}. Lang: ${language}.`;
  return await callDeepSeek(prompt);
}

export async function generateRitualPrayer(ritualType: string, name: string, language: string): Promise<string> {
  const prompt = `Write ritual prayer for ${ritualType}, name ${name}. Lang: ${language}.`;
  return await callDeepSeek(prompt);
}

export async function generateYearlyFortune(name: string, birthInfo: string, language: string): Promise<string> {
  const prompt = `Yearly fortune for ${name}, born ${birthInfo}. Lang: ${language}.`;
  return await callDeepSeek(prompt);
}

export async function generateTarotReading(cards: string[], language: string): Promise<string> {
  const prompt = `Tarot reading: ${cards.join(', ')}. Lang: ${language}.`;
  return await callDeepSeek(prompt);
 }

export async function generateMicroContent(itemId: string, userInput: string, language: string): Promise<string> {
    let promptTemplate = MICRO_ITEM_PROMPTS[itemId] || "Generate a blessing.";
    let prompt = promptTemplate.replace('{{lang}}', language).replace('{{input}}', userInput || 'General');
    return await callDeepSeek(prompt);
}

export async function generateSupportResponse(query: string, language: string): Promise<string> {
    const prompt = `Support: ${query}. Lang: ${language}.`;
    return await callDeepSeek(prompt);
}

export async function generateSageResponse(message: string, deityId: string, language: string, history: string[]): Promise<string> {
    const prompt = `Roleplay deity ${deityId}. Msg: ${message}. Lang: ${language}.`;
    return await callDeepSeek(prompt);
}

export async function generateBlessingAudio(text: string): Promise<string | null> {
  if (!ai) return null;
  try {
    const config = {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    };
    const response = await callGemini("gemini-2.5-flash-preview-tts", [{ parts: [{ text: text }] }], config);
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio ? `data:audio/mp3;base64,${base64Audio}` : null;
  } catch (error) { return null; }
}

export function getRandomDeity(): string {
    return "Mazu"; 
}

export async function generateBlessingImage(subject: string, isGolden: boolean = false): Promise<string | null> {
    try {
        let stylePrompt = "Cute 3D chibi blind box toy figure, Pixar style, adorable, big eyes, clean 3d render, soft studio lighting, pastel colors, white background.";
        if (isGolden) {
            stylePrompt = "ULTRA RARE GOLDEN EDITION, Solid Gold Material, shiny metallic texture, glowing divine aura, luxury, sparkling, masterpiece, best quality, 3D render, epic lighting.";
        }
        
        const prompt = `A ${stylePrompt} of ${subject}. (Negative: photorealistic, human face, religious realism, ugly, deformed)`;
        
        const config = { imageConfig: { aspectRatio: "1:1" } };
        const response = await callGemini('gemini-2.5-flash-image', { parts: [{ text: prompt }] }, config);
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
        
        // FALLBACK
        return isGolden ? STOCK_IMAGES.gold : STOCK_IMAGES.default;

    } catch (error) {
        console.error("Image Gen Failed", error);
        return isGolden ? STOCK_IMAGES.gold : STOCK_IMAGES.default;
    }
}