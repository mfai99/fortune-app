import React, { useState } from 'react';
import { Image as ImageIcon, Star, Loader2, Download, Coins, AlertCircle, CheckCircle, Dice5, X } from 'lucide-react';
import { LanguageCode, UserProfile, GalleryItem } from '../types';
import { t } from '../constants'; // Removed STRIPE_PRICES
import { Card, BigButton, PaymentLogos } from './Common';
import { generateBlessingImage, getRandomDeity } from '../services/gemini';
// Removed initiateCheckout

interface Props {
  language: LanguageCode;
  user: UserProfile | null;
  addTransaction: (amount: number, type: 'deposit' | 'spend', desc: string) => void;
  addToGallery: (item: Omit<GalleryItem, 'id' | 'date'>) => void;
  updatePityCount: (newCount: number) => void;
}

const AiStudioView: React.FC<Props> = ({ language, user, addTransaction, addToGallery, updatePityCount }) => {
  const [subject, setSubject] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isBuying, setIsBuying] = useState(false);
  const [buyingPackIndex, setBuyingPackIndex] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [showApology, setShowApology] = useState(false);
  
  const [isGoldenResult, setIsGoldenResult] = useState(false);

  const credits = user?.coins || 0;
  const cost = 10; 

  // DEBUG: Visualize Pity
  const currentPity = user?.pityCount || 0;
  const probabilities = [0.05, 0.15, 0.25, 0.35, 1.0];
  const nextChance = probabilities[Math.min(currentPity, 4)] * 100;

  const handleBlindBox = () => {
      const key = getRandomDeity();
      setSubject(key.charAt(0).toUpperCase() + key.slice(1));
  };

  const handleGenerate = async () => {
    if (!subject.trim()) return;
    if (credits < cost) {
        alert("Insufficient Credits! Please Top Up.");
        window.scrollTo({ top: 1000, behavior: 'smooth' });
        return;
    }

    setIsGenerating(true);
    setResultUrl(null);
    setShowApology(false);
    setIsGoldenResult(false);
    
    // --- GACHA LOGIC ---
    let isGolden = false;
    // Use pity from PROPS not local const to ensure latest
    const pity = user?.pityCount || 0;
    const chance = probabilities[Math.min(pity, 4)];
    const roll = Math.random();
    
    console.log(`GACHA: Pity=${pity}, Chance=${chance}, Roll=${roll}`);

    if (roll < chance) {
        console.log(">>> GOLDEN TRIGGERED!");
        isGolden = true;
        setIsGoldenResult(true);
        updatePityCount(0); // Reset
    } else {
        console.log(">>> Normal Result");
        updatePityCount(pity + 1); // Increment
    }
    
    addTransaction(cost, 'spend', `Generated Image ${isGolden ? '(GOLDEN)' : ''}: ${subject}`);

    try {
        // Pass isGolden to service
        const url = await generateBlessingImage(subject, isGolden);
        
        if (url) {
            setResultUrl(url);
            addToGallery({
                type: 'image',
                content: url,
                title: subject + (isGolden ? ' (Gold)' : '')
            });
        } else {
            throw new Error("Image Generation Failed");
        }

    } catch (error) {
        console.error("Generation Failed:", error);
        addTransaction(cost, 'deposit', `Refund: Generation Failed`);
        addTransaction(10, 'deposit', `Apology Gift`);
        setShowApology(true);
    } finally {
        setIsGenerating(false);
    }
  };

  const buyCredits = (amount: number, index: number) => {
      const links = [
          "https://buy.stripe.com/7sYfZjd2Z4lO3b487R9ws07", 
          "https://buy.stripe.com/eVq28tgfb3hKcLE3RB9ws08", 
          "https://buy.stripe.com/7sY8wRe732dG8vobk39ws09"
      ];
      const link = links[index];
      if (link) {
          window.open(link, '_blank');
      } else {
          alert("Link not found");
      }
  };

  return (
    <div className="space-y-8 animate-fadeIn relative">
      {/* Modals */}
      {showSuccess && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black/90 text-white px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center animate-scaleIn border-4 border-green-500">
              <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
              <h3 className="text-2xl font-black">{t(language, 'checkin_success')}</h3>
              <p className="text-xl font-bold text-yellow-400 mt-2">{showSuccess}</p>
          </div>
      )}
      
      {showApology && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl border-4 border-red-500 text-center relative">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 mb-2">{t(language, 'ai_error_title')}</h3>
                  <p className="text-gray-600 mb-6">{t(language, 'ai_error_desc')}</p>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200 mb-6">
                      <p className="font-bold text-green-800">{t(language, 'ai_refund_msg').replace('{cost}', cost.toString())}</p>
                      <p className="font-bold text-green-800">{t(language, 'ai_bonus_msg')}</p>
                  </div>
                  <button onClick={() => setShowApology(false)} className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition">{t(language, 'ai_close_btn')}</button>
              </div>
          </div>
      )}

      <h2 className="text-4xl font-black text-black mb-6 border-b-4 border-pink-500 pb-3">
        {t(language, 'ai_studio_title')}
      </h2>

      <div className="bg-gradient-to-r from-black via-gray-900 to-pink-900 rounded-xl p-6 text-white flex justify-between items-center shadow-xl border-2 border-pink-500">
          <div>
              <p className="text-pink-400 text-sm font-bold uppercase tracking-widest mb-1">{t(language, 'ai_credits_balance')}</p>
              <div className="flex items-center gap-2">
                  <Coins className="text-pink-400 fill-pink-400" size={32} />
                  <span className="text-4xl font-black">{credits}</span>
              </div>
               
               {/* DEBUG: PITY COUNTER VISUAL */}
              <div className="mt-4 w-full max-w-[200px] bg-black/50 p-2 rounded-lg border border-gray-700">
                  <div className="flex justify-between text-xs text-gray-300 mb-1">
                      <span>Golden Chance:</span>
                      <span className={nextChance >= 100 ? "text-yellow-400 font-bold animate-pulse" : "text-white"}>
                          {nextChance.toFixed(0)}%
                      </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-600 to-yellow-300 transition-all duration-500"
                        style={{ width: `${(currentPity / 5) * 100}%` }} 
                      ></div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 text-center">
                      Generate {5 - currentPity} more for Guarantee
                  </p>
              </div>

          </div>
          <button onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })} className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 px-6 rounded-full shadow-lg transition">
              {t(language, 'ai_buy_credits')}
          </button>
      </div>
      
      <Card title={t(language, 'ai_studio_desc')} className="bg-gray-50 border-gray-300">
        <div className="space-y-6">
            <div className="p-4 rounded-xl border-2 bg-pink-100 border-pink-600 text-pink-900 shadow-md flex items-center justify-center gap-2">
                <ImageIcon size={32} />
                <span className="font-bold">{t(language, 'ai_generate_image')}</span>
                <span className="text-xs bg-pink-600 text-white px-2 py-1 rounded-full">{t(language, 'ai_cost_image')}</span>
            </div>

            <div className="relative">
                <label className="block text-xl font-medium text-gray-700 mb-2">{t(language, 'ai_input_placeholder')}</label>
                <div className="flex gap-2">
                    <textarea 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="E.g., A cute golden dragon..."
                        className="flex-grow p-4 border-2 border-gray-300 rounded-xl text-lg h-32 focus:border-pink-500 outline-none focus:ring-1 focus:ring-pink-500 resize-none"
                    />
                    <button 
                        onClick={handleBlindBox}
                        className="w-24 shrink-0 bg-gradient-to-b from-yellow-400 to-orange-500 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg hover:scale-105 transition-transform border-2 border-yellow-200 z-10"
                        title="Random Deity"
                    >
                        <Dice5 size={32} className="animate-bounce" />
                        <span className="text-xs text-center leading-tight">Blind Box<br/>(Random)</span>
                    </button>
                </div>
            </div>

            <BigButton icon={Star} onClick={handleGenerate} color="bg-pink-600" hoverColor="hover:bg-pink-700">
                {isGenerating ? <div className="flex items-center gap-2"><Loader2 className="animate-spin" />{t(language, 'ai_generating')}</div> : `${t(language, 'ai_generate_image')} (-${cost})`}
            </BigButton>
        </div>
      </Card>

      {/* Result Display */}
      {resultUrl && (
          <div className={`animate-scaleIn bg-white p-4 rounded-xl shadow-2xl border-4 ${isGoldenResult ? 'border-yellow-400 ring-4 ring-yellow-200' : 'border-pink-400'} relative`}>
              {isGoldenResult && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 font-black px-6 py-2 rounded-full shadow-lg z-20 animate-bounce whitespace-nowrap">
                      ✨ LEGENDARY GOLD EDITION ✨
                  </div>
              )}
              
              <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">{t(language, 'ai_result_title')}</h3>
              
              <div className="rounded-lg overflow-hidden border border-gray-200 mb-4 bg-black flex justify-center">
                  <img src={resultUrl} alt="Generated" className="max-h-[500px] object-contain" />
              </div>
              
              <a href={resultUrl} download={`blessing-image-${Date.now()}`} className="block w-full py-3 bg-green-600 text-white font-bold text-center rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2">
                  <Download size={20} /> Save Image
              </a>
          </div>
      )}

      {/* Credit Packs */}
      <h3 className="text-2xl font-bold text-gray-800 border-t pt-8 mt-8 flex items-center gap-2">{t(language, 'ai_buy_credits')}...</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
              { amount: 100, price: 99, label: 'ai_pack_1', desc: 'ai_pack_1_desc', color: 'bg-white border-gray-300' },
              { amount: 350, price: 299, label: 'ai_pack_2', desc: 'ai_pack_2_desc', color: 'bg-pink-50 border-pink-400 ring-4 ring-pink-100', recommended: true },
              { amount: 1200, price: 999, label: 'ai_pack_3', desc: 'ai_pack_3_desc', color: 'bg-purple-50 border-purple-400', bestValue: true },
          ].map((pack, i) => (
              <button key={i} disabled={isBuying} onClick={() => buyCredits(pack.amount, i)} className={`relative p-6 rounded-xl border-2 shadow-md hover:scale-105 transition-transform flex flex-col items-center ${pack.color} ${isBuying ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {pack.recommended && <span className="absolute -top-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-md">{t(language, 'ai_badge_hot')}</span>}
                  {pack.bestValue && <span className="absolute -top-3 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">{t(language, 'ai_badge_best')}</span>}
                  <div className="flex items-center gap-2 mb-2"><Coins size={32} className="text-pink-600 fill-pink-500" /><span className="text-3xl font-black text-black">{pack.amount}</span></div>
                  <h4 className="font-bold text-lg mb-2 text-gray-800">{t(language, pack.label as any)}</h4>
                  <p className="text-xs text-center text-gray-600 mb-4 h-10 px-2">{t(language, pack.desc as any)}</p>
                  <span className={`w-full py-2 font-bold rounded-lg transition flex items-center justify-center ${isBuying && buyingPackIndex === i ? 'bg-pink-500 text-white' : 'bg-black text-white hover:bg-gray-800'}`}>{isBuying && buyingPackIndex === i ? <Loader2 className="animate-spin w-5 h-5" /> : `NT$ ${pack.price}`}</span>
              </button>
          ))}
      </div>
      <PaymentLogos />
    </div>
  );
};

export default AiStudioView;