import React, { useState } from 'react';
import { Flame } from 'lucide-react';
import { LanguageCode } from '../types';
import { t, STRIPE_PRICES } from '../constants';
import { Card, BigButton } from './Common';

interface Props {
  language: LanguageCode;
}

const LampView: React.FC<Props> = ({ language }) => {
  const [isLit, setIsLit] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLight = () => {
    if (isLit) return;
    
    // PAYMENT
    if(STRIPE_PRICES.rituals_lamp) {
        window.open(STRIPE_PRICES.rituals_lamp, '_blank');
    } else {
        alert("Payment link not configured.");
    }

    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        setIsLit(true);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-4xl font-black text-black mb-6 border-b-4 border-pink-500 pb-3">
        {t(language, 'peaceLamp')}
      </h2>
      
      <Card title={t(language, 'lamp_title')}>
        <div className="flex flex-col items-center justify-center py-8">
            <div className={`relative transition-all duration-1000 ${isLit ? 'scale-110' : 'scale-100'}`}>
                {/* Glow effect */}
                {isLit && (
                    <div className="absolute inset-0 bg-pink-400 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                )}
                <div className={`text-9xl mb-6 transition-colors duration-1000 ${isLit ? 'text-pink-500 drop-shadow-[0_0_30px_rgba(236,72,153,0.8)]' : 'text-gray-300'}`}>
                    <Flame className={isLit ? 'fill-pink-500' : 'fill-gray-300'} size={160} />
                </div>
            </div>

            <p className="text-xl text-center text-gray-700 max-w-lg mb-8">
                {isLit ? t(language, 'lamp_lit_msg') : t(language, 'lamp_desc')}
            </p>

            {!isLit ? (
                <BigButton 
                    icon={Flame} 
                    onClick={handleLight} 
                    color="bg-pink-600" 
                    hoverColor="hover:bg-pink-700"
                >
                    {isProcessing ? t(language, 'paymentProcessing') : t(language, 'lamp_light_btn')}
                </BigButton>
            ) : (
                <div className="px-6 py-3 bg-pink-100 text-pink-800 rounded-xl font-bold border-2 border-pink-400">
                    ✨ {t(language, 'lamp_lit_msg')} ✨
                </div>
            )}
        </div>
      </Card>
    </div>
  );
};

export default LampView;