import React, { useState } from 'react';
import { Zap, Lock, Unlock, CreditCard, Sparkles, Star } from 'lucide-react';
import { LanguageCode, UserProfile } from '../types';
import { t, STRIPE_PRICES } from '../constants';
import { Card, BigButton } from './Common';
import { generateFortuneAnalysis } from '../services/gemini';

interface FreeDrawViewProps {
  language: LanguageCode;
  user: UserProfile | null;
  addTransaction: (amount: number, type: 'deposit' | 'spend', desc: string) => void;
}

interface FortuneResult {
  title: string;
  desc: string;
}

const FreeDrawView: React.FC<FreeDrawViewProps> = ({ language, user, addTransaction }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [qianResult, setQianResult] = useState<FortuneResult | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const qians: FortuneResult[] = [
    { title: `${t(language, 'topBlessing')}：${t(language, 'blessing')}`, desc: t(language, 'fortuneDesc1') },
    { title: `${t(language, 'topSign')}：平步青雲`, desc: t(language, 'fortuneDesc2') },
    { title: `${t(language, 'middleSign')}：平順安穩`, desc: t(language, 'fortuneDesc3') },
    { title: `${t(language, 'lowSign')}：保守為宜`, desc: t(language, 'fortuneDesc4') },
  ];

  const handleDraw = () => {
    if (isDrawing) return;
    setIsDrawing(true);
    // Free Draw
    setQianResult(null);
    setIsUnlocked(false);
    setAiAnalysis('');
    
    setTimeout(() => {
      const result = qians[Math.floor(Math.random() * qians.length)];
      setQianResult(result);
      setIsDrawing(false);
    }, 2500); 
  };

  const handleUnlock = async () => {
    // OPEN STRIPE LINK
    if (STRIPE_PRICES.unlock_daily_draw) {
        window.open(STRIPE_PRICES.unlock_daily_draw, '_blank');
    } else {
        alert("Payment link not configured.");
    }
    
    // Simulate success for UX preview (optional)
    // In real app, wait for webhook. Here we assume they paid.
    setIsUnlocked(true);
    setIsGeneratingAi(true);

    if (qianResult) {
        const analysis = await generateFortuneAnalysis(qianResult.title, language);
        setAiAnalysis(analysis);
    }
    
    setIsGeneratingAi(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-4xl font-black text-black mb-6 border-b-4 border-pink-500 pb-3">
        {t(language, 'dailyDraw')}
      </h2>
      <Card title={t(language, 'drawFortune')}>
        <div className="text-center py-6 min-h-[300px] flex flex-col items-center justify-center">
          {qianResult ? (
            <div className="space-y-8 w-full animate-flash">
              <div className="relative mx-auto max-w-md">
                <div className="bg-pink-50 p-8 rounded-xl border-4 border-pink-300 shadow-xl relative overflow-hidden animate-scaleIn">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-pink-500"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-pink-500"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-pink-500"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-pink-500"></div>
                  <div className="relative z-10">
                      <p className="text-pink-600 font-bold uppercase tracking-widest mb-2">Fortune Result</p>
                      <p className="text-4xl font-black text-pink-800 mb-4">{qianResult.title}</p>
                      <div className="h-1 w-20 bg-pink-300 mx-auto mb-4"></div>
                      <p className="text-xl text-gray-800 font-serif leading-relaxed">{qianResult.desc}</p>
                  </div>
                  <div className="absolute top-4 right-8 transform rotate-12 opacity-0 animate-stamp" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                      <div className="w-20 h-20 border-4 border-red-600 rounded-full flex items-center justify-center text-red-600 font-black text-3xl shadow-sm bg-white/50 backdrop-blur-sm">
                          吉
                      </div>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-gray-300 pt-8 w-full">
                  <h3 className="text-2xl font-bold text-black mb-4 flex items-center justify-center gap-2">
                      {t(language, 'deepAnalysisTitle')}
                      {isUnlocked ? <Unlock className="w-6 h-6 text-green-500" /> : <Lock className="w-6 h-6 text-red-500" />}
                  </h3>
                  
                  {isUnlocked ? (
                       <div className="bg-white p-6 rounded-xl text-left space-y-4 animate-fadeIn border-2 border-pink-200 shadow-lg">
                           {isGeneratingAi ? (
                               <div className="flex flex-col items-center justify-center space-y-4 py-8 text-pink-600">
                                   <Sparkles className="w-12 h-12 animate-spin" />
                                   <span className="text-lg font-bold animate-pulse">{t(language, 'generatingAi')}</span>
                               </div>
                           ) : (
                               <div className="whitespace-pre-line text-lg text-gray-800 leading-relaxed font-serif">
                                   {aiAnalysis}
                               </div>
                           )}
                       </div>
                  ) : (
                      <div className="relative overflow-hidden rounded-xl bg-gray-100 p-8 text-center border-2 border-gray-200">
                          <div className="filter blur-md select-none opacity-40 space-y-4 mb-4 text-left p-4">
                                <h4 className="text-xl font-bold text-gray-800">大師指示：</h4>
                                <p className="text-gray-700">關於您的事業發展，今年將會遇到...</p>
                                <p className="text-gray-700">在感情方面，您需要特別注意...</p>
                          </div>
                          
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-6">
                              <p className="text-xl font-bold text-black mb-4 drop-shadow-md">
                                  {t(language, 'unlockPrompt')}
                              </p>
                              <button 
                                onClick={handleUnlock}
                                className="bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-4 px-8 rounded-full shadow-2xl transform transition hover:scale-105 flex items-center gap-3 border-2 border-white ring-4 ring-pink-100"
                              >
                                  <CreditCard className="w-6 h-6" />
                                  <span className="text-xl">{t(language, 'unlockAnalysis')}</span>
                              </button>
                          </div>
                      </div>
                  )}
              </div>

            </div>
          ) : isDrawing ? (
            <div className="flex flex-col items-center justify-center">
               <div className="relative w-32 h-48 bg-gradient-to-b from-yellow-700 to-yellow-900 rounded-b-2xl border-4 border-yellow-600 shadow-xl flex items-end justify-center overflow-hidden animate-shake origin-bottom">
                   <div className="absolute top-4 w-24 h-40 bg-yellow-100/10 rounded-full blur-xl"></div>
                   <div className="text-6xl absolute top-10 opacity-80">🥡</div>
               </div>
              <p className="text-2xl font-bold text-pink-600 mt-8 animate-pulse tracking-widest">{t(language, 'drawing')}</p>
            </div>
          ) : (
            <div className="space-y-4 flex flex-col items-center">
                <div className="w-40 h-40 bg-pink-100 rounded-full flex items-center justify-center mb-4 border-4 border-pink-200">
                    <Star className="w-20 h-20 text-pink-400" />
                </div>
                <p className="text-xl text-gray-600 mb-6 max-w-xs">心誠則靈，點擊按鈕抽取今日運勢。</p>
            </div>
          )}
        </div>
        
        {!qianResult && (
            <BigButton 
            icon={Zap} 
            onClick={!isDrawing ? handleDraw : undefined} 
            color="bg-purple-600" 
            hoverColor="hover:bg-purple-700"
            >
                {isDrawing ? t(language, 'drawing') : t(language, 'drawFortune')}
            </BigButton>
        )}
        
        {qianResult && (
             <button 
             onClick={() => { setQianResult(null); setIsUnlocked(false); }}
             className="mt-6 text-gray-500 hover:text-pink-600 underline w-full text-center font-bold"
            >
                Restart / Draw Again
            </button>
        )}
      </Card>
    </div>
  );
};

export default FreeDrawView;