
import React from 'react';
import { LanguageCode, PageId, UserProfile } from '../types';
import { MENU_ITEMS, t, USER_ID } from '../constants';
import { LifeBuoy, X } from 'lucide-react';

interface SidebarProps {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  language: LanguageCode;
  user: UserProfile | null;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, language, user, onClose }) => {
  const baseClasses = "flex items-center p-3 my-2 rounded-xl transition duration-200 ease-in-out font-bold text-lg w-full text-left";
  const activeClasses = "bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)] transform scale-[1.02] border border-pink-400";
  const inactiveClasses = "text-gray-400 hover:bg-gray-800 hover:text-pink-200 hover:border-l-4 hover:border-pink-500";

  const handleNavClick = (id: PageId) => {
      setCurrentPage(id);
      if (onClose) onClose();
  };

  return (
    <div className="w-64 bg-black text-white flex flex-col h-full shadow-2xl p-4 shrink-0 overflow-y-auto border-r border-gray-800 relative">
      <div className="md:hidden absolute top-4 right-4">
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
              <X size={24} />
          </button>
      </div>

      <div className="text-center pb-6 border-b border-gray-800 mb-4 mt-2 md:mt-0">
        <h1 className="text-2xl md:text-3xl font-black text-pink-500 tracking-wider drop-shadow-md">
          {t(language, 'appName')}
        </h1>
        <p className="text-sm mt-1 text-gray-500">
          {t(language, 'version')}
        </p>
      </div>

      <nav className="flex-grow space-y-2">
        {MENU_ITEMS.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            >
              <Icon className={`w-8 h-8 mr-4 shrink-0 ${isActive ? 'text-white' : 'text-pink-600'}`} />
              <span>{t(language, item.translationKey as any)}</span>
              {item.badge && item.badge > 0 && (
                <span className="ml-auto bg-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-full animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-4 pt-4 border-t border-gray-800 space-y-4 pb-20 md:pb-0">
        <button 
            className="w-full flex items-center justify-center gap-2 py-2 bg-gray-800 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition"
            onClick={() => window.open('mailto:support@fortune-assistant.com')}
        >
            <LifeBuoy size={18} />
            {t(language, 'support_btn')}
        </button>

        <div>
            <p className="text-base text-gray-400">{t(language, 'userID')}:</p>
            <p className="text-lg font-bold text-white break-all">
            {user ? user.name : USER_ID}
            </p>
            <p className="text-xs mt-2 text-pink-700">{t(language, 'version')}</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
