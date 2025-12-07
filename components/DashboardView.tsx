import React, { useState } from 'react';
import { LanguageCode, UserStats, UserProfile, PageId } from '../types';
import { t, USER_ID } from '../constants';
import { Card } from './Common';
import { Zap, Sparkles, Flame, Image as ImageIcon, Calendar, CheckCircle } from 'lucide-react';

interface DashboardViewProps {
  stats: UserStats;
  language: LanguageCode;
  user: UserProfile | null;
  onCheckIn: () => void;
  setCurrentPage: (page: PageId) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ stats, language, user, onCheckIn, setCurrentPage }) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = user?.lastCheckIn === todayStr || isCheckedIn;

  const handleCheckInClick = () => {
      if (hasCheckedInToday) return;
      setIsCheckedIn(true);
      onCheckIn();
  };

  // GENERIC WELCOME MESSAGE
  const getWelcomeMessage = () => {
      switch(language) {
          case 'zh_TW': return "尊敬的用戶，歡迎回來";
          case 'zh_CN': return "尊敬的用户，欢迎回来";
          default: return "Respected User, Welcome Back";
      }
  };

  // SHORT ID LOGIC
  const rawId = user ? user.id : USER_ID;
  const displayId = rawId.length >= 8 
    ? `${rawId.substring(0, 4).toUpperCase()}-${rawId.substring(4, 8).toUpperCase()}` 
    : rawId;

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-4xl font-black text-black mb-6 border-b-4 border-pink-500 pb-3">
        {t(language, 'dashboard')}
      </h2>

      <div className="bg-gradient-to-r from-pink-600 to-purple-800 rounded-xl p-6 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between border-2 border-white/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="z-10 mb-4 md:mb-0">
              <h3 className="text-2xl font-black flex items-center gap-2">
                  <Calendar className="text-pink-300" />
                  {t(language, 'checkin_title')}
              </h3>
              <p className="opacity-90 mt-1">
                  {t(language, 'checkin_streak')}: <span className="font-bold text-yellow-300 text-xl">{user?.checkInStreak || 0} Days</span>
              </p>
          </div>

          <div className="z-10">
              {hasCheckedInToday ? (
                  <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full font-bold flex items-center gap-2 border border-white/30">
                      <CheckCircle className="text-green-400" />
                      {t(language, 'checkin_success')}
                  </div>
              ) : (
                  <button 
                    onClick={handleCheckInClick}
                    className="bg-white text-pink-700 font-extrabold px-8 py-3 rounded-full shadow-lg hover:bg-pink-50 hover:scale-105 transition-all flex items-center gap-2 animate-bounce"
                  >
                      {t(language, 'checkin_btn')}
                      <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full ml-1">
                          {t(language, 'checkin_reward')}
                      </span>
                  </button>
              )}
          </div>
      </div>
      
      <Card title={getWelcomeMessage()} className="bg-gray-50 border-pink-500">
        <p className="mt-2 text-base font-mono text-gray-600 break-all">
            {t(language, 'userID')}: <span className="font-bold text-pink-600">{displayId}</span>
        </p>
      </Card>

      <h3 className="text-2xl font-bold text-gray-800">{t(language, 'quickGuide')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            onClick={() => setCurrentPage('dailyDraw')}
            className="bg-white p-6 rounded-xl border border-pink-200 shadow-lg flex flex-col items-center text-center transition-transform hover:scale-105 cursor-pointer hover:border-pink-500"
          >
              <Zap className="w-12 h-12 text-pink-600 mb-4" />
              <h4 className="font-bold text-lg mb-2 text-black">{t(language, 'dailyDraw')}</h4>
              <p className="text-sm text-gray-500 mb-4">{t(language, 'unlockAnalysis')}</p>
          </div>
          <div 
            onClick={() => setCurrentPage('nameBlessing')}
            className="bg-white p-6 rounded-xl border border-pink-200 shadow-lg flex flex-col items-center text-center transition-transform hover:scale-105 cursor-pointer hover:border-pink-500"
          >
              <Sparkles className="w-12 h-12 text-pink-600 mb-4" />
              <h4 className="font-bold text-lg mb-2 text-black">{t(language, 'nameBlessing')}</h4>
              <p className="text-sm text-gray-500 mb-4">{t(language, 'bless_generate')}</p>
          </div>
          <div 
            onClick={() => setCurrentPage('rituals')}
            className="bg-white p-6 rounded-xl border border-pink-200 shadow-lg flex flex-col items-center text-center transition-transform hover:scale-105 cursor-pointer hover:border-pink-500"
          >
              <Flame className="w-12 h-12 text-pink-600 mb-4" />
              <h4 className="font-bold text-lg mb-2 text-black">{t(language, 'rituals')}</h4>
              <p className="text-sm text-gray-500 mb-4">{t(language, 'rituals_lamp_name')}</p>
          </div>
          <div 
            onClick={() => setCurrentPage('aiStudio')}
            className="bg-white p-6 rounded-xl border border-pink-200 shadow-lg flex flex-col items-center text-center transition-transform hover:scale-105 cursor-pointer hover:border-pink-500"
          >
              <ImageIcon className="w-12 h-12 text-pink-600 mb-4" />
              <h4 className="font-bold text-lg mb-2 text-black">{t(language, 'aiStudio')}</h4>
              <p className="text-sm text-gray-500 mb-4">{t(language, 'ai_generate_video')}</p>
          </div>
      </div>
    </div>
  );
};

export default DashboardView;