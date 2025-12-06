
import React from 'react';
import { LanguageCode } from '../types';
import { t } from '../constants';

interface LanguageSwitcherProps {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, setLanguage }) => {
  const languages: LanguageCode[] = ['zh_TW', 'zh_CN', 'en'];
  
  const getLangNameKey = (lang: LanguageCode): any => {
    switch(lang) {
        case 'zh_TW': return 'traditionalChinese';
        case 'zh_CN': return 'simplifiedChinese';
        case 'en': return 'english';
        default: return 'english';
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2 flex-wrap justify-end max-w-xs">
      {languages.map(lang => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`px-3 py-2 rounded-lg font-semibold text-sm transition duration-200 ${
            language === lang
              ? 'bg-pink-600 text-white shadow-[0_0_10px_rgba(236,72,153,0.5)]'
              : 'bg-black/80 text-pink-400 border border-pink-600 hover:bg-pink-900'
          }`}
        >
          {t(language, getLangNameKey(lang))}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
