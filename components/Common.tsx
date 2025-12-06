
import React from 'react';
import { LucideIcon, Smartphone } from 'lucide-react';

interface CardProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '' }) => (
  <div className={`p-6 bg-white rounded-xl shadow-xl border-b-8 border-pink-500 ${className}`}>
    <h3 className="text-2xl font-extrabold text-black mb-4 border-b-2 border-pink-100 pb-2 flex items-center gap-2">
      <span className="w-2 h-8 bg-pink-500 rounded-full inline-block"></span>
      {title}
    </h3>
    <div className="text-gray-800 text-lg">{children}</div>
  </div>
);

interface BigButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  color?: string;
  hoverColor?: string;
  icon?: LucideIcon;
}

export const BigButton: React.FC<BigButtonProps> = ({ 
  children, 
  onClick, 
  color = 'bg-pink-600', 
  hoverColor = 'hover:bg-pink-700', 
  icon: Icon 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-center px-6 py-4 ${color} text-white font-extrabold text-xl rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-pink-500/30 ${hoverColor}`}
  >
    {Icon && <Icon className="w-7 h-7 mr-3" />}
    {children}
  </button>
);

export const PaymentLogos: React.FC = () => (
  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200">
    <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-wider">
      <span className="flex items-center gap-1">🔒 Secure SSL Payment</span>
    </div>
    <div className="flex flex-wrap gap-2">
       <div className="h-8 px-3 bg-blue-900 text-white rounded flex items-center font-bold italic border border-blue-950">VISA</div>
       <div className="h-8 px-3 bg-red-600 text-white rounded flex items-center font-bold border border-red-700">Mastercard</div>
       <div className="h-8 px-3 bg-blue-600 text-white rounded flex items-center font-bold border-l-4 border-green-500 border-r-4 border-green-500">JCB</div>
       <div className="h-8 px-3 bg-black text-white rounded flex items-center gap-1 font-bold border border-gray-700">
         <Smartphone size={14} /> Apple Pay
       </div>
       <div className="h-8 px-3 bg-white text-gray-600 rounded flex items-center gap-1 font-bold border border-gray-300">
         <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" /> Pay
       </div>
    </div>
  </div>
);
