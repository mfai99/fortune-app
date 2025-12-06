
import React, { useState, useRef } from 'react';
import { Sparkles, Download, Share2, Play, Volume2 } from 'lucide-react';
import { LanguageCode, UserProfile } from '../types';
import { t } from '../constants';
import { Card, BigButton } from './Common';
import { generateBlessingPoem, generateBlessingAudio } from '../services/gemini';

interface Props {
  language: LanguageCode;
  user: UserProfile | null;
  addTransaction: (amount: number, type: 'deposit' | 'spend', desc: string) => void;
}

const NameBlessingView: React.FC<Props> = ({ language, user, addTransaction }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('health');
  const [generated, setGenerated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [poem, setPoem] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (!name.trim() || isProcessing) return;
    
    if ((user?.coins || 0) < 12) {
        alert("Insufficient Coins! Need 12 Coins.");
        return;
    }

    setIsProcessing(true);
    addTransaction(12, 'spend', `Name Blessing: ${name}`); // Deduct

    await new Promise(resolve => setTimeout(resolve, 1500));
    const text = await generateBlessingPoem(name, type, language);
    setPoem(text);
    setGenerated(true);
    setIsProcessing(false);
  };

  const handleVoiceUpgrade = async () => {
    if (isGeneratingAudio || !poem) return;
    
    if ((user?.coins || 0) < 12) {
        alert("Insufficient Coins for Voice! Need 12 Coins.");
        return;
    }

    setIsGeneratingAudio(true);
    addTransaction(12, 'spend', `Voice Blessing: ${name}`); // Deduct

    await new Promise(resolve => setTimeout(resolve, 1500));
    const url = await generateBlessingAudio(poem);
    setAudioUrl(url);
    setIsGeneratingAudio(false);
  };

  const playAudio = () => {
    if (audioRef.current) {
        audioRef.current.play();
    }
  };

  const getTypeLabel = (key: string) => {
      if (key === 'health') return t(language, 'bless_type_health');
      if (key === 'wealth') return t(language, 'bless_type_wealth');
      if (key === 'love') return t(language, 'bless_type_love');
      return t(language, 'bless_type_career');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-4xl font-black text-black mb-6 border-b-4 border-pink-500 pb-3">
        {t(language, 'nameBlessing')}
      </h2>
      
      {!generated ? (
        <Card title={t(language, 'nameBlessing')}>
          <div className="space-y-6">
            <div>
              <label className="block text-xl font-medium text-gray-700 mb-2">{t(language, 'bless_inputName')}</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t(language, 'bless_inputName')} 
                className="w-full p-4 border-2 border-pink-300 rounded-xl text-xl focus:border-pink-500 outline-none" 
              />
            </div>
            
            <div>
              <label className="block text-xl font-medium text-gray-700 mb-2">{t(language, 'bless_selectType')}</label>
              <div className="grid grid-cols-2 gap-3">
                {['health', 'wealth', 'love', 'career'].map((tKey) => (
                    <button
                        key={tKey}
                        onClick={() => setType(tKey)}
                        className={`p-4 rounded-xl text-lg font-bold border-2 transition-all ${
                            type === tKey 
                            ? 'bg-pink-100 border-pink-500 text-pink-800 shadow-md transform scale-105' 
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {getTypeLabel(tKey)}
                    </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <BigButton 
                icon={Sparkles} 
                onClick={handleGenerate}
                color="bg-pink-600" 
                hoverColor="hover:bg-pink-700"
              >
                {isProcessing ? t(language, 'paymentProcessing') : `${t(language, 'bless_generate')} (12 Coins)`}
              </BigButton>
            </div>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col items-center animate-scaleIn">
            <div className="w-full max-w-md bg-gradient-to-br from-pink-50 to-white p-8 rounded-2xl shadow-2xl border-4 border-pink-500 text-center relative overflow-hidden mb-8">
                <div className="mb-6">
                    <span className="inline-block px-4 py-1 bg-pink-600 text-white rounded-full text-sm font-bold tracking-widest uppercase mb-2">
                        {t(language, 'bless_cardTitle')}
                    </span>
                    <h3 className="text-4xl font-black text-black mt-2">{name}</h3>
                </div>
                
                <div className="py-8 border-t border-b border-pink-200 min-h-[160px] flex items-center justify-center">
                    <p className="text-2xl font-serif text-pink-900 leading-relaxed whitespace-pre-line">
                        {poem}
                    </p>
                </div>

                <div className="mt-6 flex justify-between items-end">
                    <div className="text-left">
                        <p className="text-xs text-gray-500">Category</p>
                        <p className="font-bold text-pink-700">{getTypeLabel(type)}</p>
                    </div>
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center border-2 border-pink-800 text-pink-800 font-bold text-xs opacity-50 transform rotate-12">
                        吉
                    </div>
                </div>
            </div>
            
            <div className="w-full max-w-md mb-6">
                {!audioUrl ? (
                    <button 
                        onClick={handleVoiceUpgrade}
                        disabled={isGeneratingAudio}
                        className="w-full py-4 bg-purple-100 border-2 border-purple-500 text-purple-900 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-purple-200 transition"
                    >
                        {isGeneratingAudio ? (
                            <span>{t(language, 'paymentProcessing')}</span>
                        ) : (
                            <>
                                <Volume2 className="w-6 h-6" />
                                {`${t(language, 'bless_voice_upgrade')} (12 Coins)`}
                            </>
                        )}
                    </button>
                ) : (
                    <button 
                        onClick={playAudio}
                        className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-purple-700 transition animate-pulse"
                    >
                        <Play className="w-6 h-6" />
                        {t(language, 'bless_play_voice')}
                    </button>
                )}
                <audio ref={audioRef} src={audioUrl || ''} className="hidden" />
            </div>

            <div className="flex gap-4 w-full max-w-md">
                <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition">
                    <Download className="w-5 h-5" /> Save
                </button>
                <button className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition">
                    <Share2 className="w-5 h-5" /> Share
                </button>
            </div>
            
            <button 
                onClick={() => { setGenerated(false); setName(''); setPoem(''); setAudioUrl(null); }}
                className="mt-6 text-gray-500 underline"
            >
                Create Another
            </button>
        </div>
      )}
    </div>
  );
};

export default NameBlessingView;
