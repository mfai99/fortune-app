import React, { useState } from 'react';
import { Layers, Sparkles, Lock, Unlock, CreditCard } from 'lucide-react';
import { LanguageCode, UserProfile } from '../types';
import { t, TAROT_CARDS, STRIPE_PRICES } from '../constants';
import { Card, BigButton } from './Common';
import { generateTarotReading } from '../services/gemini';

interface Props {
  language: LanguageCode;
  user: UserProfile | null;
  addTransaction: (amount: number, type: 'deposit' | 'spend', desc: string) => void;
}

type GameState = 'intro' | 'shuffling' | 'selecting' | 'revealed' | 'unlocked';

const TarotView: React.FC<Props> = ({ language, user, addTransaction }) => {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [shuffledDeck, setShuffledDeck] = useState<string[]>([]);
  const [reading, setReading] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const startShuffle = () => {
    // Free to shuffle
    setGameState('shuffling');
    const deck = [...TAROT_CARDS];
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    setShuffledDeck(deck);

    setTimeout(() => {
        setGameState('selecting');
    }, 2000);
  };

  const handleCardClick = (index: number) => {
      if (gameState !== 'selecting') return;
      if (selectedCards.includes(index)) return;

      const newSelection = [...selectedCards, index];
      setSelectedCards(newSelection);

      if (newSelection.length === 3) {
          setTimeout(() => {
              setGameState('revealed');
          }, 1000);
      }
  };

  const handleUnlock = async () => {
      // OPEN STRIPE LINK
      if (STRIPE_PRICES.unlock_tarot) {
          window.open(STRIPE_PRICES.unlock_tarot, '_blank');
      } else {
          alert("Payment link not configured.");
      }

      setIsProcessing(true);
      
      const cards = selectedCards.map(idx => shuffledDeck[idx]);
      const text = await generateTarotReading(cards, language);
      
      setReading(text);
      setIsProcessing(false);
      setGameState('unlocked');
  };

  const getPositionLabel = (idx: number) => {
      if (idx === 0) return t(language, 'tarot_past');
      if (idx === 1) return t(language, 'tarot_present');
      return t(language, 'tarot_future');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-4xl font-black text-black mb-6 border-b-4 border-pink-500 pb-3">
        {t(language, 'tarot_title')}
      </h2>

      {gameState === 'intro' && (
          <Card title={t(language, 'tarot_title')}>
              <div className="text-center py-10">
                  <Layers className="w-24 h-24 mx-auto text-pink-600 mb-6" />
                  <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                      {t(language, 'tarot_desc')}
                  </p>
                  <BigButton 
                    icon={Sparkles} 
                    onClick={startShuffle} 
                    color="bg-pink-600" 
                    hoverColor="hover:bg-pink-700"
                  >
                      {t(language, 'tarot_start_btn')}
                  </BigButton>
              </div>
          </Card>
      )}

      {gameState === 'shuffling' && (
          <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-48 h-72">
                  <div className="absolute inset-0 bg-pink-900 rounded-xl border-4 border-white shadow-xl animate-ping opacity-20"></div>
                  <div className="absolute inset-0 bg-pink-800 rounded-xl border-4 border-pink-400 shadow-2xl flex items-center justify-center animate-bounce">
                      <Layers className="text-white w-16 h-16 animate-spin" />
                  </div>
              </div>
              <p className="mt-8 text-2xl font-bold text-pink-900 animate-pulse">Shuffling Fate...</p>
          </div>
      )}

      {gameState === 'selecting' && (
          <div className="space-y-6 text-center">
              <p className="text-2xl font-bold text-black">{t(language, 'tarot_picking')} ({selectedCards.length}/3)</p>
              <div className="flex flex-wrap justify-center gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} onClick={() => handleCardClick(i)} className={`w-20 h-32 md:w-24 md:h-40 rounded-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-4 ${selectedCards.includes(i) ? 'bg-pink-400 -translate-y-6 ring-4 ring-pink-500' : 'bg-black border-2 border-pink-500'} shadow-xl flex items-center justify-center`}>
                          <div className="w-full h-full border-2 border-pink-600/50 rounded-lg flex items-center justify-center bg-gray-900"><Sparkles className="text-pink-400 w-6 h-6 opacity-50" /></div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {(gameState === 'revealed' || gameState === 'unlocked') && (
          <div className="space-y-8 animate-scaleIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {selectedCards.map((deckIndex, pos) => (
                      <div key={pos} className="relative w-full h-64 perspective-1000">
                          <div className={`relative w-full h-full text-center transition-transform duration-1000 transform-style-3d ${gameState === 'revealed' || gameState === 'unlocked' ? 'rotate-y-180' : ''}`}>
                              <div className="absolute w-full h-full bg-black border-4 border-pink-500 rounded-xl flex items-center justify-center backface-hidden shadow-xl"><Layers className="text-pink-600 w-12 h-12" /></div>
                              <div className="absolute w-full h-full bg-white border-4 border-pink-300 rounded-xl rotate-y-180 backface-hidden shadow-xl p-4 flex flex-col items-center justify-center overflow-hidden">
                                   <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 z-10">{getPositionLabel(pos)}</p>
                                   <div className="bg-pink-50 rounded-lg w-20 h-20 flex items-center justify-center mb-4 border border-pink-100 z-10"><Layers className="w-10 h-10 text-pink-400" /></div>
                                   <h3 className="text-lg font-black text-pink-900 z-10">{shuffledDeck[deckIndex].split('(')[0]}</h3>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>

              <div className="relative mt-8">
                  <div className={`bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-1000 border-t-8 border-pink-500 ${gameState === 'unlocked' ? '' : 'max-h-96'}`}>
                      <div className="p-8">
                          <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                              {gameState === 'unlocked' ? <Unlock className="text-green-500" /> : <Lock className="text-red-500" />}
                              {t(language, 'deepAnalysisTitle')}
                          </h3>
                          
                          {gameState === 'unlocked' ? (
                              <div className="prose prose-lg max-w-none text-gray-800 whitespace-pre-line animate-fadeIn">{reading}</div>
                          ) : (
                              <div className="space-y-6 filter blur-sm select-none opacity-60">
                                  <p className="text-xl text-gray-800">The cards indicate a powerful shift in your destiny...</p>
                                  <p className="text-xl text-gray-800">The Fool in the past position suggests...</p>
                              </div>
                          )}
                      </div>

                      {gameState === 'revealed' && (
                          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent flex flex-col items-center justify-center p-6 pt-32">
                              <p className="text-lg text-pink-600 font-bold mb-4 animate-bounce">{t(language, 'unlockPrompt')}</p>
                              <button 
                                onClick={handleUnlock}
                                className="bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black text-xl py-4 px-10 rounded-full shadow-2xl transform transition hover:scale-105 flex items-center gap-3 border-4 border-white ring-4 ring-pink-200"
                              >
                                  <span>{t(language, 'tarot_unlock_btn')}</span>
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TarotView;