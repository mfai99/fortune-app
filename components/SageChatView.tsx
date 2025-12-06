
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Coins, Sparkles, Send, RefreshCcw } from 'lucide-react';
import { LanguageCode } from '../types';
import { t } from '../constants';
import { Card, BigButton } from './Common';
import { generateSageResponse } from '../services/gemini';

interface Props {
  language: LanguageCode;
}

type DeityId = 'landgod' | 'wealth' | 'matchmaker' | 'mazu' | 'guanyu';

interface Message {
  sender: 'user' | 'sage';
  text: string;
}

const SageChatView: React.FC<Props> = ({ language }) => {
  const [selectedDeity, setSelectedDeity] = useState<DeityId | null>(null);
  const [hasOffered, setHasOffered] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const deities = [
      { id: 'landgod', name: t(language, 'deity_landgod'), desc: t(language, 'deity_landgod_desc'), cost: 0, color: 'bg-green-50 text-green-800 border-green-300' },
      { id: 'wealth', name: t(language, 'deity_wealth'), desc: t(language, 'deity_wealth_desc'), cost: 10, color: 'bg-yellow-50 text-yellow-800 border-yellow-300' },
      { id: 'matchmaker', name: t(language, 'deity_matchmaker'), desc: t(language, 'deity_matchmaker_desc'), cost: 10, color: 'bg-pink-50 text-pink-800 border-pink-300' },
      { id: 'mazu', name: t(language, 'deity_mazu'), desc: t(language, 'deity_mazu_desc'), cost: 20, color: 'bg-blue-50 text-blue-800 border-blue-300' },
      { id: 'guanyu', name: t(language, 'deity_guanyu'), desc: t(language, 'deity_guanyu_desc'), cost: 20, color: 'bg-red-50 text-red-800 border-red-300' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDeitySelect = (id: DeityId) => {
      setSelectedDeity(id);
      setHasOffered(false);
      setMessages([]);
  };

  const handleOffering = async () => {
      if (!selectedDeity) return;
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setHasOffered(true);
      setIsProcessing(false);
      const deityName = deities.find(d => d.id === selectedDeity)?.name;
      setMessages([{ sender: 'sage', text: `(Divine Presence: ${deityName}) I am listening. What is your question?` }]);
  };

  const handleSend = async () => {
      if (!input.trim() || !selectedDeity || isProcessing) return;
      const userMsg = input;
      setInput('');
      setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
      setIsProcessing(true);
      const historyStrings = messages.map(m => `${m.sender}: ${m.text}`);
      const response = await generateSageResponse(userMsg, selectedDeity, language, historyStrings);
      setMessages(prev => [...prev, { sender: 'sage', text: response }]);
      setIsProcessing(false);
  };

  if (!selectedDeity) {
      return (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-4xl font-black text-black mb-6 border-b-4 border-pink-500 pb-3">
                {t(language, 'chat_title')}
            </h2>
            <Card title={t(language, 'chat_select_deity')}>
                <div className="grid grid-cols-1 gap-4">
                    {deities.map(d => (
                        <button
                            key={d.id}
                            onClick={() => handleDeitySelect(d.id as DeityId)}
                            className={`p-6 rounded-xl border-l-8 text-left transition-transform hover:scale-102 hover:shadow-lg ${d.color} flex justify-between items-center`}
                        >
                            <div>
                                <h3 className="text-2xl font-black">{d.name}</h3>
                                <p className="opacity-80">{d.desc}</p>
                            </div>
                            <div className="bg-white/50 px-3 py-1 rounded-full font-bold">
                                {d.cost === 0 ? 'Free' : `${d.cost} Coins`}
                            </div>
                        </button>
                    ))}
                </div>
            </Card>
        </div>
      );
  }

  if (!hasOffered) {
      const deity = deities.find(d => d.id === selectedDeity);
      return (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-4xl font-black text-black mb-6 border-b-4 border-pink-500 pb-3">
                {t(language, 'chat_title')}
            </h2>
            <Card title={t(language, 'chat_offering_title')}>
                <div className="text-center py-8">
                    <div className="w-24 h-24 mx-auto bg-pink-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <Coins className="w-12 h-12 text-pink-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-black">{t(language, 'chat_offering_title')} to {deity?.name}</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        To consult with {deity?.name}, a small offering of <b>{deity?.cost} Fortune Coins</b> is required to show sincerity.
                    </p>
                    <BigButton 
                        icon={Sparkles}
                        onClick={handleOffering}
                        color="bg-pink-600"
                        hoverColor="hover:bg-pink-700"
                    >
                        {isProcessing ? t(language, 'paymentProcessing') : t(language, 'chat_unlock_btn')}
                    </BigButton>
                    <button onClick={() => setSelectedDeity(null)} className="mt-6 text-gray-500 underline">
                        Cancel
                    </button>
                </div>
            </Card>
        </div>
      );
  }

  return (
    <div className="space-y-4 animate-fadeIn h-full flex flex-col">
      <div className="flex justify-between items-center border-b-4 border-pink-500 pb-3 mb-2">
           <h2 className="text-3xl font-black text-black">
                {t(language, 'chat_title')}
           </h2>
           <button 
                onClick={() => setSelectedDeity(null)}
                className="flex items-center gap-2 px-3 py-1 bg-gray-200 rounded-lg text-sm font-bold hover:bg-gray-300"
            >
               <RefreshCcw size={16} />
               {t(language, 'chat_history_clear')}
           </button>
      </div>

      <div className="flex-grow bg-white rounded-xl border-2 border-pink-100 overflow-hidden flex flex-col shadow-inner min-h-[500px]">
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => {
                  const isUser = msg.sender === 'user';
                  return (
                      <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`
                              max-w-[85%] md:max-w-[70%] p-4 rounded-2xl shadow-md text-lg
                              ${isUser ? 'bg-pink-500 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 border border-gray-200 rounded-tl-none'}
                          `}>
                              {!isUser && (
                                  <p className="text-xs font-bold text-pink-600 mb-1 flex items-center gap-1">
                                      <Sparkles size={12} />
                                      {deities.find(d => d.id === selectedDeity)?.name}
                                  </p>
                              )}
                              {msg.text}
                          </div>
                      </div>
                  );
              })}
              <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={t(language, 'chat_placeholder')}
                    className="flex-grow p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-pink-500 outline-none"
                    disabled={isProcessing}
                  />
                  <button 
                    onClick={handleSend}
                    disabled={isProcessing || !input.trim()}
                    className="bg-pink-600 text-white p-4 rounded-xl hover:bg-pink-700 disabled:bg-gray-400 transition-colors"
                  >
                      <Send size={24} />
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default SageChatView;
