import React, { useState } from 'react';
import { ShoppingCart, DollarSign, Crown, Star, Video, Image as ImageIcon, X, Loader2, Download, Share2, Sparkles, AlertCircle } from 'lucide-react';
import { LanguageCode, MicroItem, UserProfile } from '../types';
import { t, MICRO_SHOP_ITEMS, STRIPE_PRICES } from '../constants';
import { Card, BigButton, PaymentLogos } from './Common';
import { generateMicroContent } from '../services/gemini';

interface Props {
  language: LanguageCode;
  user: UserProfile | null;
  addTransaction: (amount: number, type: 'deposit' | 'spend', desc: string) => void;
}

const ShopView: React.FC<Props> = ({ language, user, addTransaction }) => {
  const [selectedItem, setSelectedItem] = useState<MicroItem | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultContent, setResultContent] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Membership Plans
  const plans = [
    { name: t(language, 'shop_plan99_name'), desc: t(language, 'shop_plan99_desc'), price: 99, icon: Star, color: 'bg-blue-600', popular: false, link: STRIPE_PRICES.unlock_daily_draw },
    { name: t(language, 'shop_plan299_name'), desc: t(language, 'shop_plan299_desc'), price: 299, icon: Crown, color: 'bg-gradient-to-r from-pink-600 to-purple-800', popular: true, link: STRIPE_PRICES.shop_plan299 },
  ];

  // Physical/High Value Items
  const physicalItems = [
      { name: t(language, 'shop_item1_name'), desc: t(language, 'shop_item1_desc'), price: 499, icon: Sparkles, color: 'bg-red-800', link: STRIPE_PRICES.shop_item1 },
      { name: t(language, 'shop_item2_name'), desc: t(language, 'shop_item2_desc'), price: 399, icon: Coins, color: 'bg-yellow-700', link: STRIPE_PRICES.shop_item2 },
      { name: t(language, 'shop_item3_name'), desc: t(language, 'shop_item3_desc'), price: 299, icon: Shield, color: 'bg-red-600', link: STRIPE_PRICES.shop_item3 },
      { name: t(language, 'shop_video_name'), desc: t(language, 'shop_video_desc'), price: 199, icon: Video, color: 'bg-purple-700', link: STRIPE_PRICES.shop_video },
      { name: t(language, 'shop_wallpaper_name'), desc: t(language, 'shop_wallpaper_desc'), price: 50, icon: ImageIcon, color: 'bg-blue-500', link: STRIPE_PRICES.shop_wallpaper },
  ];

  const handleMicroClick = (item: MicroItem) => {
      setSelectedItem(item);
      setInputValue('');
      if (item.type.startsWith('input')) {
          setShowInputModal(true);
      } else {
          processMicroTransaction(item, '');
      }
  };

  const processMicroTransaction = async (item: MicroItem, input: string) => {
      // Balance Check
      if ((user?.coins || 0) < item.price) {
          alert(`Insufficient Coins! Need ${item.price}, you have ${user?.coins}. Please Top Up.`);
          return;
      }

      setShowInputModal(false);
      setIsProcessing(true);
      setShowResultModal(true);
      
      // Deduct Coins & Record Transaction
      addTransaction(item.price, 'spend', `Purchased ${t(language, item.nameKey as any)}`);

      await new Promise(resolve => setTimeout(resolve, 2000)); // Delay for animation
      
      try {
          const content = await generateMicroContent(item.id, input, language);
          setResultContent(content);
      } catch (e) {
          console.error("Micro Gen Failed", e);
          setResultContent("Generation failed. Please try again. (Coins refunded)");
          addTransaction(item.price, 'deposit', `Refund: ${t(language, item.nameKey as any)}`);
      }
      
      setIsProcessing(false);
  };

  const handleInputSubmit = () => {
      if (selectedItem) {
          processMicroTransaction(selectedItem, inputValue);
      }
  };

  const handleCashPurchase = (link: string) => {
      if (link) {
          // OPEN IN NEW TAB
          window.open(link, '_blank');
      } else {
          alert("Payment link not available.");
      }
  };

  const getInputPlaceholder = (type: string) => {
      if (type === 'input_wish') return t(language, 'shop_input_wish');
      if (type === 'input_question') return t(language, 'shop_input_question');
      return '';
  };

  const zodiacSigns = ["鼠 (Rat)", "牛 (Ox)", "虎 (Tiger)", "兔 (Rabbit)", "龍 (Dragon)", "蛇 (Snake)", "馬 (Horse)", "羊 (Goat)", "猴 (Monkey)", "雞 (Rooster)", "狗 (Dog)", "豬 (Pig)"];

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-4xl font-black text-black mb-6 border-b-4 border-pink-500 pb-3">
        {t(language, 'shop_title')}
      </h2>

      {/* Micro Shop (Coins) */}
      <div className="bg-gradient-to-br from-pink-50 to-white p-6 rounded-xl border-2 border-pink-200 shadow-inner">
          <div className="mb-6">
              <h3 className="text-2xl font-bold text-pink-900 flex items-center gap-2">
                  <Sparkles className="text-pink-600" />
                  {t(language, 'shop_micro_title')}
              </h3>
              <p className="text-pink-700">{t(language, 'shop_micro_desc')}</p>
              <p className="text-sm font-bold text-gray-500 mt-2">
                  Your Balance: <span className="text-pink-600 text-lg">{user?.coins || 0} Coins</span>
              </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {MICRO_SHOP_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                      <button 
                        key={item.id}
                        onClick={() => handleMicroClick(item)}
                        className={`
                            flex flex-col items-center justify-center p-4 rounded-xl border-2 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 bg-white group
                            ${item.color}
                        `}
                      >
                          <div className="bg-white/80 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
                              <Icon size={24} />
                          </div>
                          <p className="font-bold text-sm text-center mb-1">{t(language, item.nameKey as any)}</p>
                          <span className="text-xs font-bold bg-black text-white px-2 py-0.5 rounded-full">
                              {item.price} Coins
                          </span>
                      </button>
                  )
              })}
          </div>
      </div>

      {/* Membership Plans (Cash) */}
      <h3 className="text-2xl font-bold text-gray-800 mt-8">會員方案 (Cash)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
                <div key={i} className={`relative p-6 rounded-xl shadow-2xl text-white ${plan.color} transform transition hover:scale-[1.02]`}>
                    {plan.popular && (
                        <span className="absolute top-4 right-4 bg-red-500 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                            {t(language, 'shop_popular')}
                        </span>
                    )}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/20 rounded-full">
                            <Icon className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                    </div>
                    <p className="text-lg opacity-90 mb-6 min-h-[3rem]">{plan.desc}</p>
                    <button 
                        onClick={() => handleCashPurchase(plan.link)}
                        className="w-full py-3 bg-black text-white font-extrabold rounded-lg shadow hover:bg-gray-800 transition"
                    >
                        {t(language, 'shop_pay')} NT${plan.price}
                    </button>
                </div>
            )
        })}
      </div>

      {/* Physical / High Value Items (Cash) */}
      <h3 className="text-2xl font-bold text-gray-800 mt-8">開運好物 (Cash)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {physicalItems.map((item, i) => {
              const Icon = item.icon;
              return (
                  <div key={i} className={`p-6 rounded-xl shadow-lg text-white ${item.color} border-4 border-white/20`}>
                      <div className="flex justify-between items-start mb-4">
                          <Icon size={32} className="opacity-80" />
                          <span className="bg-black/30 px-3 py-1 rounded-full text-sm font-bold">NT$ {item.price}</span>
                      </div>
                      <h4 className="text-xl font-bold mb-2">{item.name}</h4>
                      <p className="text-sm opacity-80 mb-6 min-h-[40px]">{item.desc}</p>
                      <button 
                          onClick={() => handleCashPurchase(item.link)}
                          className="w-full py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-100 transition"
                      >
                          {t(language, 'shop_add')}
                      </button>
                  </div>
              )
          })}
      </div>
      
      <PaymentLogos />

      {/* Input Modal */}
      {showInputModal && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative border-4 border-pink-500">
                  <button onClick={() => setShowInputModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                      <X size={24} />
                  </button>
                  <h3 className="text-2xl font-bold mb-4 text-black">{t(language, selectedItem.nameKey as any)}</h3>
                  
                  {selectedItem.type === 'input_zodiac' ? (
                      <div className="grid grid-cols-3 gap-2 mb-6">
                          {zodiacSigns.map(z => (
                              <button 
                                key={z} 
                                onClick={() => setInputValue(z)}
                                className={`p-2 rounded border text-sm ${inputValue === z ? 'bg-pink-600 text-white' : 'bg-gray-100'}`}
                              >
                                  {z}
                              </button>
                          ))}
                      </div>
                  ) : (
                      <textarea 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={getInputPlaceholder(selectedItem.type)}
                        className="w-full p-4 border-2 border-gray-300 rounded-xl mb-6 text-lg h-32 outline-none focus:border-pink-500"
                      />
                  )}

                  <button 
                    onClick={handleInputSubmit}
                    disabled={!inputValue}
                    className="w-full py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 disabled:bg-gray-300"
                  >
                      Pay {selectedItem.price} Coins
                  </button>
              </div>
          </div>
      )}

      {/* Result Modal - VISUALLY ENHANCED */}
      {showResultModal && selectedItem && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
               <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(236,72,153,0.5)] relative flex flex-col border-4 border-pink-500 animate-elastic-pop">
                   
                   <div className="bg-black text-white p-4 flex justify-between items-center shrink-0 z-10 relative">
                       <h3 className="font-bold text-lg text-pink-400 flex items-center gap-2">
                           <Sparkles size={18} />
                           {t(language, 'shop_delivery_title')}
                       </h3>
                       {!isProcessing && (
                           <button onClick={() => setShowResultModal(false)}>
                               <X size={24} />
                           </button>
                       )}
                   </div>

                   <div className="p-0 overflow-y-auto flex-grow flex flex-col items-center justify-center min-h-[400px] relative">
                       {isProcessing ? (
                           <div className="text-center z-10">
                               <div className="relative mb-6">
                                   <div className="absolute inset-0 bg-pink-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                                   <Loader2 className="w-20 h-20 text-pink-600 animate-spin relative" />
                               </div>
                               <p className="text-2xl font-black text-gray-800 animate-pulse">{t(language, 'generatingAi')}</p>
                               <p className="text-sm text-gray-500 mt-2">Connecting to Divine Source...</p>
                           </div>
                       ) : (
                           <div className="w-full h-full flex flex-col relative bg-gray-50">
                               {/* Divine Background Effect */}
                               <div className="absolute inset-0 overflow-hidden">
                                   <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-300 rounded-full filter blur-3xl opacity-20 animate-spin-slow"></div>
                                   <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-300 rounded-full filter blur-3xl opacity-20 animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
                               </div>

                               {/* Card Content */}
                               <div className="relative z-10 flex-grow p-8 flex flex-col items-center text-center">
                                   <div className={`
                                       w-full bg-white p-6 rounded-xl border-4 border-double shadow-2xl mb-6
                                       ${selectedItem.color.replace('text-', 'border-')}
                                   `}>
                                       <div className="mb-4 relative inline-block">
                                           <div className="absolute inset-0 bg-yellow-400 blur-lg opacity-40 animate-pulse"></div>
                                           {React.createElement(selectedItem.icon, { size: 64, className: "relative z-10" })}
                                       </div>
                                       
                                       <h2 className="text-2xl font-black mb-4 uppercase tracking-wider border-b-2 border-gray-100 pb-2">
                                           {t(language, selectedItem.nameKey as any)}
                                       </h2>
                                       
                                       <div className="text-xl font-serif leading-relaxed text-gray-800 whitespace-pre-line min-h-[100px]">
                                           {resultContent}
                                       </div>
                                       
                                       <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400 font-mono">
                                           Digital Blessing #{Date.now().toString().slice(-6)}
                                       </div>
                                   </div>

                                   <p className="text-gray-400 text-sm mb-4 animate-bounce">{t(language, 'shop_delivery_save')}</p>
                                   
                                   <div className="flex gap-4 w-full">
                                       <button className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 shadow-lg">
                                           <Download size={20} /> Save
                                       </button>
                                       <button className="flex-1 py-3 bg-pink-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-pink-700 shadow-lg">
                                           <Share2 size={20} /> Share
                                       </button>
                                   </div>
                               </div>
                           </div>
                       )}
                   </div>
               </div>
           </div>
      )}
    </div>
  );
};

export default ShopView;