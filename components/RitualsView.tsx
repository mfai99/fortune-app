import React, { useState, useRef } from 'react';
import { Flame, Coins, Shield, Play, Volume2, Sparkles, CheckCircle, Ghost, Flower, Sun, Moon, Anchor } from 'lucide-react';
import { LanguageCode } from '../types';
import { t, STRIPE_PRICES } from '../constants';
import { Card, BigButton } from './Common';
import { generateRitualPrayer, generateBlessingAudio } from '../services/gemini';

interface Props {
  language: LanguageCode;
}

type RitualType = 'lamp' | 'wealth' | 'karmic' | 'fest_qingming' | 'fest_ghost' | 'fest_ghost_14' | 'fest_cny' | 'fest_lantern' | 'fest_mazu';

const RitualsView: React.FC<Props> = ({ language }) => {
  const [selectedRitual, setSelectedRitual] = useState<RitualType | null>(null);
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [prayerText, setPrayerText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const rituals = [
      { id: 'lamp', name: t(language, 'rituals_lamp_name'), desc: t(language, 'rituals_lamp_desc'), icon: Flame, color: 'bg-yellow-50 border-yellow-500 text-yellow-800' },
      { id: 'wealth', name: t(language, 'rituals_wealth_name'), desc: t(language, 'rituals_wealth_desc'), icon: Coins, color: 'bg-red-50 border-red-500 text-red-800' },
      { id: 'karmic', name: t(language, 'rituals_karmic_name'), desc: t(language, 'rituals_karmic_desc'), icon: Shield, color: 'bg-indigo-50 border-indigo-500 text-indigo-800' },
  ];

  const seasonalFestivals = [
      { id: 'fest_qingming', name: t(language, 'festival_qingming'), desc: t(language, 'festival_qingming_desc'), icon: Flower },
      { id: 'fest_ghost_14', name: t(language, 'festival_ghost_14'), desc: t(language, 'festival_ghost_14_desc'), icon: Ghost },
      { id: 'fest_ghost', name: t(language, 'festival_ghost'), desc: t(language, 'festival_ghost_desc'), icon: Ghost },
      { id: 'fest_cny', name: t(language, 'festival_cny'), desc: t(language, 'festival_cny_desc'), icon: Sun },
      { id: 'fest_lantern', name: t(language, 'festival_lantern'), desc: t(language, 'festival_lantern_desc'), icon: Moon },
      { id: 'fest_mazu', name: t(language, 'festival_mazu'), desc: t(language, 'festival_mazu_desc'), icon: Anchor },
  ];

  const handlePerformRitual = async () => {
      if (!selectedRitual || !name.trim()) return;
      
      // PAYMENT LOGIC
      let link = STRIPE_PRICES.rituals_lamp;
      if (selectedRitual === 'wealth') link = STRIPE_PRICES.rituals_wealth;
      if (selectedRitual === 'karmic') link = STRIPE_PRICES.rituals_karmic;
      
      if(link) {
          window.open(link, '_blank');
      } else {
          alert("Payment link not configured.");
      }

      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      const text = await generateRitualPrayer(selectedRitual, name, language);
      setPrayerText(text);
      setIsProcessing(false);
      setIsCompleted(true);
  };

  // ... (Rest of component remains same, just handlePerformRitual updated) ...
  // Re-render for completeness
  const handleGenerateAudio = async () => {
      if (!prayerText || isGeneratingAudio) return;
      setIsGeneratingAudio(true);
      const url = await generateBlessingAudio(prayerText.substring(0, 200));
      setAudioUrl(url);
      setIsGeneratingAudio(false);
  };

  const playAudio = () => {
      if (audioRef.current) audioRef.current.play();
  };

  const reset = () => {
      setSelectedRitual(null);
      setName('');
      setIsCompleted(false);
      setPrayerText('');
      setAudioUrl(null);
  };

  const getRitualName = (id: string | null) => {
      if(!id) return '';
      const r = rituals.find(x => x.id === id);
      if(r) return r.name;
      const f = seasonalFestivals.find(x => x.id === id);
      if(f) return f.name;
      return '';
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-4xl font-black text-black mb-6 border-b-4 border-pink-500 pb-3">
        {t(language, 'rituals')}
      </h2>

      {!isCompleted ? (
          <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {rituals.map((r) => {
                      const Icon = r.icon;
                      const isSelected = selectedRitual === r.id;
                      return (
                          <div 
                            key={r.id}
                            onClick={() => setSelectedRitual(r.id as RitualType)}
                            className={`p-6 rounded-xl border-4 cursor-pointer transition-all transform hover:scale-105 ${isSelected ? r.color + ' shadow-xl scale-105' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                          >
                              <Icon className="w-12 h-12 mb-4" />
                              <h3 className="text-xl font-bold mb-2">{r.name}</h3>
                              <p className="text-sm opacity-80">{r.desc}</p>
                          </div>
                      );
                  })}
              </div>

              <div className="bg-pink-50 p-6 rounded-xl border-2 border-pink-200">
                  <h3 className="text-2xl font-bold text-pink-900 mb-4 flex items-center gap-2">
                      <Flame className="text-pink-600" />
                      {t(language, 'rituals_seasonal_title')}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {seasonalFestivals.map((f) => {
                          const Icon = f.icon;
                          const isSelected = selectedRitual === f.id;
                          return (
                            <button
                                key={f.id}
                                onClick={() => setSelectedRitual(f.id as RitualType)}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                    isSelected 
                                    ? 'bg-pink-200 border-pink-500 text-pink-900 shadow-lg' 
                                    : 'bg-white border-pink-100 text-gray-700 hover:bg-white hover:border-pink-300'
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Icon size={24} className={isSelected ? 'text-pink-700' : 'text-pink-400'} />
                                    <span className="font-bold">{f.name}</span>
                                </div>
                                <p className="text-xs opacity-75">{f.desc}</p>
                            </button>
                          );
                      })}
                  </div>
              </div>

              {selectedRitual && (
                  <Card title={t(language, 'rituals_perform_btn')} className="animate-fadeIn">
                      <div className="space-y-6">
                          <p className="text-xl text-center font-bold text-black">
                              Selected: <span className="text-pink-600">{getRitualName(selectedRitual)}</span>
                          </p>
                          <div>
                              <label className="block text-xl font-medium text-gray-700 mb-2">{t(language, 'bless_inputName')}</label>
                              <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-4 border-2 border-pink-300 rounded-xl text-xl focus:border-pink-500 outline-none"
                                placeholder={t(language, 'bless_inputName')}
                              />
                          </div>
                          <BigButton 
                            icon={Sparkles}
                            onClick={handlePerformRitual}
                            color="bg-pink-600"
                            hoverColor="hover:bg-pink-700"
                          >
                              {isProcessing ? t(language, 'paymentProcessing') : t(language, 'rituals_perform_btn')}
                          </BigButton>
                      </div>
                  </Card>
              )}
          </div>
      ) : (
          <div className="animate-scaleIn max-w-2xl mx-auto space-y-6">
              <div className="bg-white p-8 rounded-2xl border-4 border-pink-500 shadow-2xl text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                      <CheckCircle size={48} />
                  </div>
                  <h3 className="text-3xl font-black text-black mb-2">
                      {getRitualName(selectedRitual)}
                  </h3>
                  <p className="text-gray-600 mb-6">{t(language, 'lamp_lit_msg')}</p>
                  
                  <div className="bg-gray-50 p-6 rounded-xl text-left border border-gray-200 shadow-inner mb-6">
                      <h4 className="font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">
                          {t(language, 'rituals_prayer_title')}
                      </h4>
                      <p className="whitespace-pre-line text-gray-800 font-serif leading-relaxed">
                          {prayerText}
                      </p>
                  </div>

                  {!audioUrl ? (
                      <button 
                        onClick={handleGenerateAudio}
                        disabled={isGeneratingAudio}
                        className="w-full py-4 bg-orange-100 text-orange-800 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-200 transition"
                      >
                         {isGeneratingAudio ? (
                             <span className="animate-pulse">Loading Voice...</span>
                         ) : (
                             <>
                                <Volume2 size={24} />
                                {t(language, 'rituals_audio_btn')}
                             </>
                         )}
                      </button>
                  ) : (
                       <button 
                        onClick={playAudio}
                        className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition animate-pulse"
                      >
                         <Play size={24} />
                         {t(language, 'rituals_audio_btn')} (Play)
                      </button>
                  )}
                  <audio ref={audioRef} src={audioUrl || ''} className="hidden" />

                  <button onClick={reset} className="mt-8 text-gray-500 underline">
                      Perform Another Ritual
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default RitualsView;