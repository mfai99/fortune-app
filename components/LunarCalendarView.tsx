
import React from 'react';
import { Flame, Calendar } from 'lucide-react';
import { LanguageCode, PageId } from '../types';
import { t, GOD_BIRTHDAYS } from '../constants';
import { Card, BigButton } from './Common';

interface Props {
  language: LanguageCode;
  setCurrentPage: (page: PageId) => void;
}

const LunarCalendarView: React.FC<Props> = ({ language, setCurrentPage }) => {
  const getMonthName = (month: number) => {
    return `農曆 ${month} 月 (Lunar Month ${month})`; 
  };

  const handleLightLamp = () => {
    setCurrentPage('rituals');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-4xl font-black text-black mb-6 border-b-4 border-pink-500 pb-3">
        {t(language, 'calendar_title')}
      </h2>

      {GOD_BIRTHDAYS.map((monthData) => (
        <Card key={monthData.month} title={getMonthName(monthData.month)} className="mb-6">
          <div className="space-y-4">
            {monthData.days.map((day, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-pink-50 rounded-xl border border-pink-200">
                <div className="flex items-center gap-4 mb-3 md:mb-0">
                  <div className="bg-pink-200 text-pink-800 font-bold rounded-lg w-12 h-12 flex items-center justify-center shrink-0">
                    {day.day}
                  </div>
                  <div className="text-xl font-bold text-gray-800">
                    {day.name}
                  </div>
                </div>
                <button
                  onClick={handleLightLamp}
                  className="px-6 py-2 bg-pink-600 text-white rounded-full font-bold shadow-md hover:bg-pink-700 transition flex items-center justify-center gap-2"
                >
                  <Flame size={18} />
                  {t(language, 'calendar_btn')}
                </button>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">{t(language, 'lamp_desc')}</p>
        <BigButton 
          icon={Flame} 
          onClick={handleLightLamp} 
          color="bg-pink-600" 
          hoverColor="hover:bg-pink-700"
        >
          {t(language, 'lamp_light_btn')}
        </BigButton>
      </div>
    </div>
  );
};

export default LunarCalendarView;
