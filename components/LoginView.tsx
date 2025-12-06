import React, { useState } from 'react';
import { UserProfile, LanguageCode } from '../types';
import { t } from '../constants';
import { Mail, Key, User } from 'lucide-react';
import { signUpWithEmail, signInWithEmail } from '../services/supabase';

interface LoginViewProps {
  onLogin: (provider: 'google' | 'facebook') => void;
  onGuestLogin: () => void; // New Guest Prop
  onEmailLogin: (uid: string, email: string) => void; // New Email Prop
  language: LanguageCode;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onGuestLogin, onEmailLogin, language }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
      setError('');
      setLoading(true);
      try {
          if (isSignUp) {
              const { user } = await signUpWithEmail(email, password);
              if (user) {
                  alert("Sign up successful! Please check your email to confirm.");
                  // Usually need to confirm email before logging in, or auto-login if configured
                  onEmailLogin(user.id, user.email || ''); 
              }
          } else {
              const { user } = await signInWithEmail(email, password);
              if (user) {
                  onEmailLogin(user.id, user.email || '');
              }
          }
      } catch (e: any) {
          setError(e.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl border-4 border-pink-500 text-center overflow-y-auto max-h-[90vh]">
        <h2 className="text-3xl font-black text-black mb-2">
          {t(language, 'login_title')}
        </h2>
        <p className="text-gray-500 mb-6">
          {t(language, 'login_subtitle')}
        </p>

        {/* Social Login */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => onLogin('google')}
            className="w-full py-3 bg-white border-2 border-gray-300 rounded-xl font-bold text-gray-700 flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-pink-300 transition-all transform hover:scale-105 shadow-md"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
            {t(language, 'login_google')}
          </button>

          <button
            onClick={() => onLogin('facebook')}
            className="w-full py-3 bg-[#1877F2] text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#155db2] transition-all transform hover:scale-105 shadow-md"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.88c0-2.474 1.283-4.414 4.646-4.414 1.48 0 2.924.212 2.924.212v3.39h-1.66c-1.566 0-2.12.982-2.12 1.992v1.692h3.848l-.615 3.667h-3.233v7.979c3.126-.792 5.367-3.618 5.367-6.94 0-3.971-3.22-7.193-7.193-7.193C6.594 6.54 3.376 9.76 3.376 13.729c0 3.322 2.24 6.148 5.367 6.94z" />
            </svg>
            {t(language, 'login_facebook')}
          </button>
        </div>

        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR EMAIL</span>
            <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Email Login */}
        <div className="space-y-4 mt-4 text-left">
            {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
            
            <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 outline-none"
                />
            </div>
            <div className="relative">
                <Key className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 outline-none"
                />
            </div>

            <button 
                onClick={handleEmailAuth}
                disabled={loading}
                className="w-full py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 transition shadow-lg"
            >
                {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Sign In")}
            </button>

            <div className="text-center">
                <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-pink-600 font-bold hover:underline">
                    {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
                </button>
            </div>
        </div>
        
        {/* GUEST MODE */}
        <div className="mt-8 pt-4 border-t border-gray-100">
            <button 
                onClick={onGuestLogin}
                className="text-gray-500 hover:text-gray-800 font-bold text-sm flex items-center justify-center gap-2 w-full py-2 hover:bg-gray-100 rounded-lg transition"
            >
                <User size={16} />
                Continue as Guest (No Cloud Save)
            </button>
        </div>

      </div>
    </div>
  );
};

export default LoginView;