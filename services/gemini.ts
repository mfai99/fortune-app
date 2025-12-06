import { GoogleGenAI, Modality } from "@google/genai";

// --- CONFIGURATION ---
const USE_BACKEND_PROXY = false; 
const FALLBACK_KEY = "AIzaSyD6DI7fiQGBbFJjYhhWk0x62o-gJd9uqsc"; 
const API_KEY = process.env.API_KEY || FALLBACK_KEY;
const DEEPSEEK_KEY = "sk-9e41f40056714897b6d6e403c0c2cfae"; 

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
    'lucky_sign': "Generate a 'Lucky Sign' (今日好運籤) for today. Output: 4-line poem + 1 actionable advice. Lang: {{lang}}.",
    'wealth_mantra': "Generate a powerful 'Wealth Mantra' (今日財運吉語). Output: Short, punchy affirmation for money. Lang: {{lang}}.",
    'merit_point': "Generate a 'Digital Merit Certificate' text. Tone: Peaceful, holy, confirming the user has accumulated good karma. Lang: {{lang}}.",
    'mini_lamp': "Write a prayer text for lighting a 'Mini Peace Lamp'. Focus on illuminating the path ahead and safety. Lang: {{lang}}.",
    'money_magnet': "Generate a 'Money Magnet Activation' phrase. Short, punchy, energetic words to boost financial vibration. Lang: {{lang}}.",
    'wish_amulet': "Generate text for a 'Wish Fulfillment Amulet'. Tone: Gentle, magical, granting a specific wish. Lang: {{lang}}.",
    'daily_bless': "Write a 'Daily Blessing' sentence. Uplifting, positive energy for the morning. Lang: {{lang}}.",
    'zodiac_guide': "Provide specific 'Daily Guidance' for the user's Zodiac sign: {{input}}. Include Lucky Time and What to Avoid. Lang: {{lang}}.",
    'wish_note': "Compose a gentle prayer based on the user's wish: {{input}}. Help them send this wish to the heavens. Lang: {{lang}}.",
    'spiritual_calm': "Generate a 'Spiritual Calming' message. soothing words to relieve stress and anxiety. Lang: {{lang}}.",
    'wish_booster': "Generate a 'Wish Booster' incantation. High energy, accelerating the manifestation of goals. Lang: {{lang}}.",
    'wealth_god_card': "Write a message from the 'God of Wealth'. Promising prosperity and windfall luck. Lang: {{lang}}.",
    'stress_amulet': "Generate text for a 'Stress Relief Amulet'. Focus on peace of mind and letting go. Lang: {{lang}}.",
    'family_safe': "Write a prayer for 'Family Safety'. Protecting the home and health of loved ones. Lang: {{lang}}.",
    'luck_boost_3d': "Generate a 3-Day Luck Boosting plan. Day 1: Cleanse. Day 2: Attract. Day 3: Solidify. Lang: {{lang}}.",
    'quick_qa': "Provide a short, wise, oracle-style answer to the user's question: {{input}}. Do not predict death/disaster. Lang: {{lang}}.",
    'lucky_color': "Suggest a 'Lucky Color' for today and explain why it brings good energy. Lang: {{lang}}.",
    'wealth_wallpaper': "Generate a short, powerful wealth affirmation suitable for a phone wallpaper. Lang: {{lang}}.",
    'animated_guardian': "Write a message from a 'Guardian Spirit'. Tone: Protective, watching over you. Lang: {{lang}}.",
    'quotes_10': "Generate a profound spiritual quote to heal the soul. Lang: {{lang}}.",
};

// --- MOCK FALLBACK IMAGES (For 100% Success Rate) ---
const STOCK_IMAGES = {
    'default': 'https://cdn.pixabay.com/photo/2023/01/28/17/53/buddha-7751469_1280.jpg', // Cute Monk/Buddha style
    'gold': 'https://cdn.pixabay.com/photo/2020/04/08/19/05/buddha-5018536_1280.jpg' // Gold Statue
};

// --- DEEPSEEK HELPER (For Better Text) ---
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
                    { role: "system", content: "You are a wise Taoist Master. You speak with mystical authority but kindness. Output in the requested language." },
                    { role: "user", content: prompt }
                ],
                stream: false
            })
        });
        
        if (!response.ok) throw new Error("DeepSeek API Error");
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (e) {
        console.error("DeepSeek Error, falling back to Gemini:", e);
        return await callGeminiText(prompt); // Fallback
    }
}

// --- GEMINI HELPER (Fallback & Image) ---
async function callGeminiText(prompt: string) {
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
    try {
        const response = await ai.models.generateContent({
            model,
            contents,
            config: { ...config } // Safety settings relaxed in prompt
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
  const langName = language === 'en' ? 'English' : 'Traditional Chinese';
  const prompt = `Analyze this fortune sign: "${signTitle}". Language: ${langName}. Provide 3 sections: Career, Love, Health.`;
  return await callDeepSeek(prompt);
}

export async function generateBlessingPoem(name: string, type: string, language: string): Promise<string> {
  const langName = language === 'en' ? 'English' : 'Traditional Chinese';
  const prompt = `Write a 4-line blessing poem for "${name}". Type: ${type}. Language: ${langName}. Tone: Ceremonial.`;
  return await callDeepSeek(prompt);
}

export async function generateRitualPrayer(ritualType: string, name: string, language: string): Promise<string> {
  const langName = language === 'en' ? 'English' : 'Traditional Chinese';
  const prompt = `Write a formal prayer (疏文) for ritual: ${ritualType}, Beneficiary: ${name}. Language: ${langName}.`;
  return await callDeepSeek(prompt);
}

export async function generateYearlyFortune(name: string, birthInfo: string, language: string): Promise<string> {
  const langName = language === 'en' ? 'English' : 'Traditional Chinese';
  const prompt = `Generate yearly fortune (Ba Zi style) for ${name}, born ${birthInfo}. Language: ${langName}. Detailed analysis.`;
  return await callDeepSeek(prompt);
}

export async function generateTarotReading(cards: string[], language: string): Promise<string> {
  const langName = language === 'en' ? 'English' : 'Traditional Chinese';
  const prompt = `Tarot reading for: ${cards.join(', ')}. Language: ${langName}. Interpret Past, Present, Future.`;
  return await callDeepSeek(prompt);
 }

export async function generateMicroContent(itemId: string, userInput: string, language: string): Promise<string> {
    const langName = language === 'en' ? 'English' : 'Traditional Chinese';
    let promptTemplate = MICRO_ITEM_PROMPTS[itemId] || "Generate a blessing.";
    let prompt = promptTemplate.replace('{{lang}}', langName).replace('{{input}}', userInput || 'General');
    return await callDeepSeek(prompt);
}

export async function generateSupportResponse(query: string, language: string): Promise<string> {
    const langName = language === 'en' ? 'English' : 'Traditional Chinese';
    const prompt = `Customer Support: User asks: "${query}". Language: ${langName}. Answer politely.`;
    return await callDeepSeek(prompt);
}

export async function generateSageResponse(message: string, deityId: string, language: string, history: string[]): Promise<string> {
    const langName = language === 'en' ? 'English' : 'Traditional Chinese';
    let persona = "Sage";
    if (deityId === 'landgod') persona = "Tu Di Gong";
    if (deityId === 'wealth') persona = "Cai Shen";
    if (deityId === 'matchmaker') persona = "Yue Lao";
    if (deityId === 'mazu') persona = "Mazu";
    
    const prompt = `Roleplay as ${persona}. Language: ${langName}. History: ${history.slice(-2)}. User: ${message}`;
    return await callDeepSeek(prompt);
}

export async function generateBlessingAudio(text: string): Promise<string | null> {
  try {
    const config = {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    };
    // Audio MUST use Gemini (DeepSeek doesn't support audio)
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config
    });
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
        
        // --- CHIBI STYLE LOGIC (With Golden Variant) ---
        let stylePrompt = "Cute 3D chibi blind box toy figure, Pixar style, adorable, big eyes, clean 3d render, soft studio lighting, pastel colors, white background.";
        if (isGolden) {
            stylePrompt = "ULTRA RARE GOLDEN EDITION, Solid Gold Material, shiny metallic texture, glowing divine aura, luxury, sparkling, masterpiece, best quality, 3D render, epic lighting.";
        }
        
        const prompt = `A ${stylePrompt} of ${safeSubject}. (Negative: photorealistic, human face, religious realism, ugly, deformed)`;
        
        const config = { imageConfig: { aspectRatio: "1:1" } };
        // Image MUST use Gemini
        const response = await callGemini('gemini-2.5-flash-image', { parts: [{ text: prompt }] }, config);
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
        
        // FALLBACK IF API BLOCKED (Safety)
        console.warn("API Blocked content, returning Stock Image");
        return isGolden ? STOCK_IMAGES.gold : STOCK_IMAGES.default;

    } catch (error) {
        console.error("Image Gen Failed, using fallback", error);
        // FALLBACK IF NETWORK ERROR
        return isGolden ? STOCK_IMAGES.gold : STOCK_IMAGES.default;
    }
}