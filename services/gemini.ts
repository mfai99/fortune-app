import { GoogleGenAI, Modality } from "@google/genai";

// --- CONFIGURATION ---
const USE_BACKEND_PROXY = false; 
const FALLBACK_KEY = "AIzaSyD6DI7fiQGBbFJjYhhWk0x62o-gJd9uqsc"; 
const API_KEY = process.env.API_KEY || FALLBACK_KEY;

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- DATABASES ---
export const DEITY_SYMBOLS: Record<string, string> = {
    'mazu': 'Sea Guardian Goddess, wearing ornate Red Robe and Phoenix Crown, holding a jade tablet, cute benevolent smile',
    '媽祖': 'Sea Guardian Goddess, wearing ornate Red Robe and Phoenix Crown, holding a jade tablet, cute benevolent smile',
    'guanyin': 'White-robed Goddess of Mercy, holding a willow branch and vase, standing on a lotus, peaceful aura',
    '觀音': 'White-robed Goddess of Mercy, holding a willow branch and vase, standing on a lotus, peaceful aura',
    'landgod': 'Earth Grandfather, holding a wooden staff and gold ingot, long white beard, friendly old man',
    '土地公': 'Earth Grandfather, holding a wooden staff and gold ingot, long white beard, friendly old man',
    'guangong': 'General of Justice, Red Face, Long Black Beard, wearing Green Robe, holding a blade staff, majestic',
    '關公': 'General of Justice, Red Face, Long Black Beard, wearing Green Robe, holding a blade staff, majestic',
    'caishen': 'God of Wealth, wearing festive red official robes, holding a giant gold ingot, joyful smile',
    '財神': 'God of Wealth, wearing festive red official robes, holding a giant gold ingot, joyful smile',
    'tigergod': 'Cute Golden Tiger Spirit, guardian entity, biting a gold coin, round eyes',
    '虎爺': 'Cute Golden Tiger Spirit, guardian entity, biting a gold coin, round eyes',
    'yuelao': 'Elder of Love, holding red strings of fate, wearing robes with moon symbols, kindly old man',
    '月老': 'Elder of Love, holding red strings of fate, wearing robes with moon symbols, kindly old man',
    'nezha': 'Young warrior deity, holding fire spear and universe ring, riding wind fire wheels, dynamic',
    '哪吒': 'Young warrior deity, holding fire spear and universe ring, riding wind fire wheels, dynamic',
};

const MICRO_ITEM_PROMPTS: Record<string, string> = {
    'lucky_sign': "Generate a 'Lucky Sign' (今日好運籤) for today. Include a 4-line fortune poem and one specific actionable advice.",
    'wealth_mantra': "Generate a powerful 'Wealth Mantra' (今日財運吉語). Focus on attracting abundance, money flow, and financial confidence.",
    'merit_point': "Generate a 'Digital Merit Certificate' text. Tone: Peaceful, holy, confirming the user has accumulated good karma.",
    'mini_lamp': "Write a prayer text for lighting a 'Mini Peace Lamp'. Focus on illuminating the path ahead and safety.",
    'money_magnet': "Generate a 'Money Magnet Activation' phrase. Short, punchy, energetic words to boost financial vibration.",
    'wish_amulet': "Generate text for a 'Wish Fulfillment Amulet'. Tone: Gentle, magical, granting a specific wish.",
    'daily_bless': "Write a 'Daily Blessing' sentence. Uplifting, positive energy for the morning.",
    'zodiac_guide': "Provide specific 'Daily Guidance' for the user's Zodiac sign. Include Lucky Time and What to Avoid.",
    'wish_note': "Compose a gentle prayer based on the user's wish. Help them send this wish to the heavens.",
    'spiritual_calm': "Generate a 'Spiritual Calming' message. soothing words to relieve stress and anxiety.",
    'wish_booster': "Generate a 'Wish Booster' incantation. High energy, accelerating the manifestation of goals.",
    'wealth_god_card': "Write a message from the 'God of Wealth'. Promising prosperity and windfall luck.",
    'stress_amulet': "Generate text for a 'Stress Relief Amulet'. Focus on peace of mind and letting go.",
    'family_safe': "Write a prayer for 'Family Safety'. Protecting the home and health of loved ones.",
    'luck_boost_3d': "Generate a 3-Day Luck Boosting plan. Day 1: Cleanse. Day 2: Attract. Day 3: Solidify.",
    'quick_qa': "Provide a short, wise, oracle-style answer to the user's question. Do not predict death/disaster.",
    'lucky_color': "Suggest a 'Lucky Color' for today and explain why it brings good energy.",
    'wealth_wallpaper': "Generate a short, powerful wealth affirmation suitable for a phone wallpaper.",
    'animated_guardian': "Write a message from a 'Guardian Spirit'. Tone: Protective, watching over you.",
    'quotes_10': "Generate a profound spiritual quote to heal the soul.",
};

async function callGemini(model: string, contents: any, config?: any) {
    const safetySettings = [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
    ];

    if (USE_BACKEND_PROXY) {
        try {
            const res = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model, contents, config: { ...config, safetySettings } })
            });
            if (!res.ok) throw new Error("Backend Error");
            const data = await res.json();
            return {
                text: data.candidates?.[0]?.content?.parts?.[0]?.text || data.text || "",
                candidates: data.candidates
            };
        } catch (e) {
            console.error("Backend Proxy Error:", e);
            throw e;
        }
    } else {
        try {
            const response = await ai.models.generateContent({
                model,
                contents,
                config: { ...config, safetySettings }
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
}

// --- EXPORTED FUNCTIONS ---

export async function generateFortuneAnalysis(signTitle: string, language: string): Promise<string> {
  try {
    const prompt = `Act as a wise fortune teller. Sign: "${signTitle}". Lang: ${language}. Analyze Career, Love, Health. Lucky advice.`;
    const response = await callGemini('gemini-2.5-flash', prompt);
    return response.text || "Fortune analysis unavailable.";
  } catch (error) { return "Fortune analysis unavailable (Network)."; }
}

export async function generateBlessingPoem(name: string, type: string, language: string): Promise<string> {
  try {
    const prompt = `Write a 4-line blessing poem for "${name}". Type: ${type}. Lang: ${language}. Tone: Ceremonial.`;
    const response = await callGemini('gemini-2.5-flash', prompt);
    return response.text || "Blessings be upon you.";
  } catch (error) { return "Blessings be upon you."; }
}

export async function generateRitualPrayer(ritualType: string, name: string, language: string): Promise<string> {
  try {
    const prompt = `Write a formal prayer (疏文) for ritual: ${ritualType}, Beneficiary: ${name}. Lang: ${language}.`;
    const response = await callGemini('gemini-2.5-flash', prompt);
    return response.text || `May the light guide ${name}.`;
  } catch (error) { return `May the light guide ${name}.`; }
}

export async function generateYearlyFortune(name: string, birthInfo: string, language: string): Promise<string> {
  try {
    const prompt = `Generate yearly fortune (Ba Zi style) for ${name}, born ${birthInfo}. Lang: ${language}. Cover Wealth, Career, Love, Health.`;
    const response = await callGemini('gemini-2.5-flash', prompt);
    return response.text || "Yearly fortune unavailable.";
  } catch (error) { return "Yearly fortune unavailable."; }
}

export async function generateTarotReading(cards: string[], language: string): Promise<string> {
  try {
     const prompt = `Tarot reading for: ${cards.join(', ')}. Lang: ${language}. Interpret Past, Present, Future.`;
     const response = await callGemini('gemini-2.5-flash', prompt);
     return response.text || "The cards remain silent.";
  } catch (error) { return "The cards remain silent."; }
 }

export async function generateMicroContent(itemId: string, userInput: string, language: string): Promise<string> {
    try {
        const specificPrompt = MICRO_ITEM_PROMPTS[itemId] || `Generate a blessing for ${itemId}.`;
        const fullPrompt = `${specificPrompt} User Input: ${userInput}. Language: ${language}. Tone: Mystical.`;
        const response = await callGemini('gemini-2.5-flash', fullPrompt);
        return response.text || "Blessings to you.";
    } catch (error) {
        return "Blessings to you.";
    }
}

export async function generateSupportResponse(query: string, language: string): Promise<string> {
    try {
        const prompt = `You are a helpful customer support AI for 'Fortune Assistant'. User asks: "${query}". Lang: ${language}. Keep it short and helpful.`;
        const response = await callGemini('gemini-2.5-flash', prompt);
        return response.text || "Please contact us via email.";
    } catch (error) { return "Please contact us via email."; }
}

export async function generateSageResponse(message: string, deityId: string, language: string, history: string[]): Promise<string> {
  try {
    let persona = "a wise sage";
    if (deityId === 'landgod') persona = "Tu Di Gong (Earth God), friendly and protective elder";
    if (deityId === 'wealth') persona = "Cai Shen (God of Wealth), joyous and prosperous";
    if (deityId === 'matchmaker') persona = "Yue Lao (Matchmaker), wise about love and destiny";
    if (deityId === 'mazu') persona = "Mazu (Goddess of Sea), compassionate and motherly";
    if (deityId === 'guanyu') persona = "Guan Yu (God of War), loyal, righteous and decisive";

    const prompt = `Roleplay as ${persona}. Language: ${language}. Context: ${history.slice(-3).join('\n')}. User: ${message}`;
    const response = await callGemini('gemini-2.5-flash', prompt);
    return response.text || "The heavens are silent.";
  } catch (error) { return "The connection to the deity is unclear."; }
}

export async function generateBlessingAudio(text: string): Promise<string | null> {
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
    const keys = Object.keys(DEITY_SYMBOLS);
    return keys[Math.floor(Math.random() * keys.length)];
}

export async function generateBlessingImage(subject: string, isGolden: boolean = false): Promise<string | null> {
    try {
        let safeSubject = subject;
        for (const [key, val] of Object.entries(DEITY_SYMBOLS)) {
            if (subject.toLowerCase().includes(key)) safeSubject = val;
        }
        
        let stylePrompt = "Cute 3D chibi blind box toy figure, Pixar style, adorable, big eyes, clean 3d render, soft studio lighting, pastel colors, white background.";
        if (isGolden) {
            stylePrompt = "ULTRA RARE GOLDEN EDITION, Solid Gold Material, shiny metallic texture, glowing divine aura, luxury, sparkling, masterpiece, best quality, 3D render, epic lighting.";
        }
        
        const prompt = `A ${stylePrompt} of ${safeSubject}. (Negative: photorealistic, human face, religious realism, ugly, deformed)`;
        
        const config = { imageConfig: { aspectRatio: "1:1" } };
        const response = await callGemini('gemini-2.5-flash-image', { parts: [{ text: prompt }] }, config);
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
        return null;
    } catch (error) { return null; }
}