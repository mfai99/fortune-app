import React, { useState } from 'react';
import { Calendar, Lock, Unlock, CreditCard, Sparkles } from 'lucide-react';
import { LanguageCode } from '../types';
import { t, STRIPE_PRICES } from '../constants';
import { Card, BigButton } from './Common';
import { generateYearlyFortune } from '../services/gemini';

interface Props {
  language: LanguageCode;
}

const YearlyFortuneView: React.FC<Props> = ({ language }) => {
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState('');

  const handleUnlock = async () => {
    if (!name || !birth) return;

    // OPEN STRIPE LINK
    if (STRIPE_PRICES.unlock_yearly_fortune) {
        window.open(STRIPE_PRICES.unlock_yearly_fortune, '_blank');
    } else {
        alert("Payment link not configured.");
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const text = await generateYearlyFortune(name, birth, language);
    setReport(text);
    setIsProcessing(false);
    setIsUnlocked(true);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-4xl font-black text-black mb-6 border-b-4 border-pink-500 pb-3">
        {t(language, 'yearly_title')}
      </h2>
      
      <Card title={t(language, 'yearly_desc')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <label className="block text-xl font-medium text-gray-700 mb-2">{t(language, 'yearly_input_name')}</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border-2 border-pink-300 rounded-xl text-xl focus:border-pink-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-xl font-medium text-gray-700 mb-2">{t(language, 'yearly_input_birth')}</label>
                <input 
                    type="date" 
                    value={birth}
                    onChange={(e) => setBirth(e.target.value)}
                    className="w-full p-3 border-2 border-pink-300 rounded-xl text-xl focus:border-pink-500 outline-none"
                />
            </div>
        </div>

        {!isUnlocked ? (
            <div className="mt-8 relative p-8 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 text-center">
                <Lock className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-6 text-lg">Enter details above to reveal your fate.</p>
                <div className="flex justify-center">
                    <button 
                        onClick={handleUnlock}
                        disabled={isProcessing || !name || !birth}
                        className={`
                            px-8 py-4 rounded-full font-bold text-xl shadow-lg flex items-center gap-3 transition-transform hover:scale-105
                            ${!name || !birth ? 'bg-gray-400 cursor-not-allowed text-gray-200' : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-2 border-white'}
                        `}
                    >
                        {isProcessing ? (
                            <span>{t(language, 'paymentProcessing')}</span>
                        ) : (
                            <>
                                <CreditCard size={24} />
                                {t(language, 'yearly_unlock_btn')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        ) : (
            <div className="mt-8 animate-scaleIn">
                <div className="bg-white p-8 rounded-xl border-t-8 border-pink-600 shadow-2xl">
                     <h3 className="text-3xl font-black text-pink-900 mb-6 border-b pb-2 flex items-center gap-3">
                         <Sparkles className="text-pink-500" />
                         {t(language, 'yearly_report_title')}
                     </h3>
                     <div className="prose prose-lg max-w-none text-gray-800 whitespace-pre-line">
                         {report}
                     </div>
                     <button 
                        onClick={() => setIsUnlocked(false)}
                        className="mt-8 text-pink-600 underline"
                     >
                         Check Another Person
                     </button>
                </div>
            </div>
        )}
      </Card>
    </div>
  );
};

export default YearlyFortuneView;