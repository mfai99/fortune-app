
import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { LanguageCode, UserProfile } from '../types';
import { t } from '../constants';
import { Card } from './Common';

interface Props {
  language: LanguageCode;
  user: UserProfile | null;
}

const WalletView: React.FC<Props> = ({ language, user }) => {
  const transactions = user?.transactions || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-4xl font-black text-black mb-6 border-b-4 border-pink-500 pb-3">
        {t(language, 'wallet_title')}
      </h2>

      <div className="bg-gradient-to-r from-gray-900 to-black p-8 rounded-2xl shadow-2xl text-white mb-8 border-2 border-pink-500 relative overflow-hidden">
          <div className="relative z-10">
              <p className="text-pink-400 font-bold uppercase tracking-widest mb-2">{t(language, 'ai_credits_balance')}</p>
              <p className="text-6xl font-black">{user?.coins || 0}</p>
          </div>
          <Wallet className="absolute right-8 bottom-8 text-pink-900 w-32 h-32 opacity-50" />
      </div>

      <Card title={t(language, 'wallet_history')}>
          {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No transactions yet.</p>
          ) : (
              <div className="space-y-4">
                  {[...transactions].reverse().map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-full ${tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                  {tx.type === 'deposit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                              </div>
                              <div>
                                  <p className="font-bold text-gray-800 text-lg">{tx.description}</p>
                                  <p className="text-sm text-gray-500">{tx.date}</p>
                              </div>
                          </div>
                          <span className={`font-black text-xl ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                              {tx.type === 'deposit' ? '+' : '-'}{tx.amount}
                          </span>
                      </div>
                  ))}
              </div>
          )}
      </Card>
    </div>
  );
};

export default WalletView;
