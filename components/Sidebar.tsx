import React, { useState } from 'react';
import { LanguageCode, PageId, UserProfile } from '../types';
import { MENU_ITEMS, t, USER_ID } from '../constants';
import { LifeBuoy, X, Copy, Check } from 'lucide-react';
import { generateSupportResponse } from '../services/gemini';

interface SidebarProps {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  language: LanguageCode;
  user: UserProfile | null;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, language, user, onClose }) => {
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportInput, setSupportInput] = useState('');
  const [supportResponse, setSupportResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseClasses = "flex items-center p-3 my-2 rounded-xl transition duration-200 ease-in-out font-bold text-lg w-full text-left";
  const activeClasses = "bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)] transform scale-[1.02] border border-pink-400";
  const inactiveClasses = "text-gray-400 hover:bg-gray-800 hover:text-pink-200 hover:border-l-4 hover:border-pink-500";

  const handleNavClick = (id: PageId) => {
      setCurrentPage(id);
      if (onClose) onClose();
  };

  const handleSupportSubmit = async () => {
      if (!supportInput.trim()) return;
      setIsTyping(true);
      const response = await generateSupportResponse(supportInput, language);
      setSupportResponse(response);
      setIsTyping(false);
  };

  const copyUserId = () => {
      const idToCopy = user ? user.id : USER_ID;
      navigator.clipboard.writeText(idToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  // BEAUTIFY ID: Show first 8 chars in uppercase, e.g. "550E-8400"
  const rawId = user ? user.id : USER_ID;
  const displayId = rawId.length >= 8 
    ? `${rawId.substring(0, 4).toUpperCase()}-${rawId.substring(4, 8).toUpperCase()}` 
    : rawId;

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
        {/* Support Button */}
        <button 
            className="w-full flex items-center justify-center gap-2 py-2 bg-gray-800 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition"
            onClick={() => setShowSupportModal(true)}
        >
            <LifeBuoy size={18} />
            {t(language, 'support_btn')}
        </button>

        {/* User ID Section */}
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-500 mb-1">{t(language, 'userID')}:</p>
            <button 
                onClick={copyUserId}
                className="flex items-center justify-between w-full group"
                title="Click to copy full ID"
            >
                <p className="text-sm font-mono text-pink-400 font-bold tracking-widest">
                    {displayId}
                </p>
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-600 group-hover:text-white" />}
            </button>
        </div>
        
        <p className="text-xs text-center text-gray-600">{t(language, 'version')}</p>
      </div>

      {/* Smart Support Modal */}
      {showSupportModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative border-4 border-pink-500">
                  <button onClick={() => setShowSupportModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                      <X size={24} />
                  </button>
                  <h3 className="text-xl font-bold mb-4 text-black flex items-center gap-2">
                      <LifeBuoy className="text-pink-600" />
                      Smart Support AI
                  </h3>
                  
                  <div className="h-48 bg-gray-100 rounded-xl p-4 mb-4 overflow-y-auto text-sm text-gray-700">
                      {supportResponse ? (
                          <p className="whitespace-pre-line">{supportResponse}</p>
                      ) : (
                          <p className="text-gray-400 italic">How can I help you today? (e.g., "How to buy coins?", "My video failed")</p>
                      )}
                  </div>

                  <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={supportInput}
                        onChange={(e) => setSupportInput(e.target.value)}
                        placeholder="Type your issue..."
                        className="flex-grow p-2 border rounded-lg focus:border-pink-500 outline-none"
                      />
                      <button 
                        onClick={handleSupportSubmit}
                        disabled={isTyping}
                        className="bg-pink-600 text-white px-4 rounded-lg font-bold hover:bg-pink-700 disabled:bg-gray-400"
                      >
                          {isTyping ? "..." : "Ask"}
                      </button>
                  </div>
                  
                  <div className="mt-4 text-center">
                      <a href="mailto:support@fortune-assistant.com" className="text-xs text-blue-500 underline">
                          Still need help? Email Human Support
                      </a>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Sidebar;