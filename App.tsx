import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LanguageSwitcher from './components/LanguageSwitcher';
import DashboardView from './components/DashboardView';
import FreeDrawView from './components/FreeDrawView';
import NameBlessingView from './components/NameBlessingView';
import RitualsView from './components/RitualsView';
import YearlyFortuneView from './components/YearlyFortuneView';
import SageChatView from './components/SageChatView';
import ShopView from './components/ShopView';
import LunarCalendarView from './components/LunarCalendarView';
import TarotView from './components/TarotView';
import AiStudioView from './components/AiStudioView'; 
import LoginView from './components/LoginView';
import WalletView from './components/WalletView';
import GalleryView from './components/GalleryView';
import { LanguageCode, PageId, UserStats, UserProfile, Transaction, GalleryItem } from './types';
import { Menu, Loader2 } from 'lucide-react';
import { supabase, loginWithProvider, fetchUserProfile, updateUserProfile, addSupabaseTransaction, addSupabaseGalleryItem } from './services/supabase';

// --- ERROR BOUNDARY ---
interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMsg: string;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, errorMsg: '' };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorMsg: error.toString() };
  }

  componentDidCatch(error: any, errorInfo: any) {
      console.error("ErrorBoundary caught:", error, errorInfo);
      if (error.toString().includes("QuotaExceeded") || error.toString().includes("gallery")) {
          localStorage.removeItem('fba_guest'); // Clear guest data
          // We don't auto-clear Supabase data obviously
      }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 text-center">
          <h1 className="text-3xl font-bold text-pink-500 mb-4">Something went wrong</h1>
          <p className="text-gray-400 mb-4">{this.state.errorMsg}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-pink-600 rounded-full font-bold"
          >
            Reload App
          </button>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [language, setLanguage] = useState<LanguageCode>('zh_TW');
  const [stats, setStats] = useState<UserStats>({ totalUsage: 128 });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track if user is in Guest Mode (Local Storage) or Real Mode (Supabase)
  const [isGuest, setIsGuest] = useState(false);

  // --- SUPABASE AUTH & LOAD ---
  useEffect(() => {
    // 1. Check for Guest Data first (Priority if offline/testing)
    const guestData = localStorage.getItem('fba_guest');
    
    // Check Supabase Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
          // Real User Found
          setIsGuest(false);
          loadUser(session.user.id);
      } else if (guestData) {
          // No Session, but Guest Data exists -> Load Guest
          try {
              const parsed = JSON.parse(guestData);
              // Validate structure
              if (!parsed.gallery) parsed.gallery = [];
              if (!parsed.transactions) parsed.transactions = [];
              if (parsed.pityCount === undefined) parsed.pityCount = 0;
              
              setIsGuest(true);
              setUser(parsed);
              setIsLoading(false);
          } catch (e) {
              console.error("Guest Data Corrupt", e);
              localStorage.removeItem('fba_guest');
              setIsLoading(false);
          }
      } else {
          // No User, No Guest
          setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
          setIsGuest(false);
          loadUser(session.user.id);
      } else if (!isGuest) {
          // Only clear if we were not in guest mode
          setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- SAVE GUEST DATA ---
  useEffect(() => {
      if (isGuest && user) {
          try {
              localStorage.setItem('fba_guest', JSON.stringify(user));
          } catch (e) {
              console.warn("Guest Storage Full", e);
              if (user.gallery.length > 0) {
                  setUser(prev => prev ? { ...prev, gallery: prev.gallery.slice(0, -3) } : null);
              }
          }
      }
  }, [user, isGuest]);

  const loadUser = async (uid: string) => {
      setIsLoading(true);
      try {
          const profile = await fetchUserProfile(uid);
          if (profile) {
              setUser(profile);
          } else {
              // Profile not found in DB? Create simple local state for now
              // In production, we should create the profile row via SQL trigger
              const newUser: UserProfile = {
                  id: uid,
                  name: 'New User',
                  coins: 50, // Default start
                  pityCount: 0,
                  lastCheckIn: '',
                  checkInStreak: 0,
                  isLoggedIn: true,
                  transactions: [],
                  gallery: []
              };
              setUser(newUser);
              // Attempt to save to DB?
              await updateUserProfile(uid, { coins: 50 });
          }
      } catch (e) {
          console.error("Failed to load user profile", e);
      } finally {
          setIsLoading(false);
      }
  };

  const handleLogin = async (provider: 'google' | 'facebook') => {
      try {
          await loginWithProvider(provider);
      } catch (e) {
          alert("Login Failed: " + (e as any).message);
      }
  };

  const handleGuestLogin = () => {
      const guestUser: UserProfile = {
          id: `Guest_${Date.now()}`,
          name: 'Guest User',
          coins: 50,
          pityCount: 0,
          lastCheckIn: '',
          checkInStreak: 0,
          isLoggedIn: true,
          transactions: [],
          gallery: []
      };
      setUser(guestUser);
      setIsGuest(true);
      localStorage.setItem('fba_guest', JSON.stringify(guestUser));
  };

  const handleEmailLogin = (uid: string, email: string) => {
      // Session update handles the load, but we can force state
      console.log("Email Login Success", uid);
      // Ensure guest mode is off
      setIsGuest(false);
  };

  // --- STATE HELPERS (With Guest Check) ---

  const handleCheckIn = async () => {
      if (!user) return;
      const today = new Date().toISOString().split('T')[0];
      const bonus = 10;
      
      const newTx: Transaction = {
          id: `tx_${Date.now()}`,
          date: today,
          type: 'deposit',
          amount: bonus,
          description: 'Daily Check-in Reward'
      };

      const updatedUser = {
          ...user,
          coins: user.coins + bonus,
          lastCheckIn: today,
          checkInStreak: user.checkInStreak + 1,
          transactions: [newTx, ...user.transactions]
      };
      setUser(updatedUser);

      if (!isGuest) {
          await updateUserProfile(user.id, { 
              coins: updatedUser.coins, 
              lastCheckIn: today,
              checkInStreak: updatedUser.checkInStreak 
          });
          await addSupabaseTransaction(user.id, newTx);
      }
  };

  const addTransaction = async (amount: number, type: 'deposit' | 'spend', desc: string) => {
      if(!user) return;
      const newTx: Transaction = {
          id: `tx_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type,
          amount,
          description: desc
      };
      const newCoins = type === 'deposit' ? user.coins + amount : user.coins - amount;
      
      setUser({
          ...user,
          coins: newCoins,
          transactions: [newTx, ...user.transactions]
      });

      if (!isGuest) {
          await updateUserProfile(user.id, { coins: newCoins });
          await addSupabaseTransaction(user.id, newTx);
      }
  };

  const addToGallery = async (item: Omit<GalleryItem, 'id' | 'date'>) => {
      if(!user) return;
      
      // Auto-Cleanup logic for local state to keep it fast
      let currentGallery = user.gallery || [];
      if (currentGallery.length >= 15) {
           currentGallery = currentGallery.slice(0, 14); 
      }

      const newItem: GalleryItem = {
          id: `gal_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          ...item
      };
      
      setUser({
          ...user,
          gallery: [newItem, ...currentGallery]
      });

      if (!isGuest) {
          await addSupabaseGalleryItem(user.id, newItem);
      }
  };

  const updatePityCount = async (newCount: number) => {
      if (!user) return;
      setUser({ ...user, pityCount: newCount });
      if (!isGuest) {
          await updateUserProfile(user.id, { pityCount: newCount });
      }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardView stats={stats} language={language} user={user} onCheckIn={handleCheckIn} setCurrentPage={setCurrentPage} />;
      case 'dailyDraw': return <FreeDrawView language={language} user={user} addTransaction={addTransaction} />;
      case 'tarot': return <TarotView language={language} user={user} addTransaction={addTransaction} />;
      case 'nameBlessing': return <NameBlessingView language={language} user={user} addTransaction={addTransaction} />;
      case 'rituals': return <RitualsView language={language} />;
      case 'yearlyFortune': return <YearlyFortuneView language={language} />;
      case 'sageChat': return <SageChatView language={language} />;
      case 'shop': return <ShopView language={language} user={user} addTransaction={addTransaction} />;
      case 'lunarCalendar': return <LunarCalendarView language={language} setCurrentPage={setCurrentPage} />;
      case 'aiStudio': return <AiStudioView language={language} user={user} addTransaction={addTransaction} addToGallery={addToGallery} updatePityCount={updatePityCount} />;
      case 'wallet': return <WalletView language={language} user={user} />;
      case 'gallery': return <GalleryView language={language} user={user} />;
      default: return <DashboardView stats={stats} language={language} user={user} onCheckIn={handleCheckIn} setCurrentPage={setCurrentPage} />;
    }
  };

  if (isLoading) {
      return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-12 h-12 text-pink-600 animate-spin" /></div>;
  }

  return (
    <ErrorBoundary>
        <div className="flex min-h-screen antialiased bg-gray-100 text-lg font-sans overflow-x-hidden">
          <LanguageSwitcher language={language} setLanguage={setLanguage} />
          
          {!user ? (
              <LoginView 
                onLogin={handleLogin} 
                onGuestLogin={handleGuestLogin}
                onEmailLogin={handleEmailLogin}
                language={language} 
              />
          ) : (
              <>
                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div className={`
                    fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
                    md:relative md:translate-x-0
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <Sidebar 
                        currentPage={currentPage} 
                        setCurrentPage={setCurrentPage} 
                        language={language}
                        user={user} 
                        onClose={() => setIsMobileMenuOpen(false)}
                    />
                </div>
                
                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 min-h-screen">
                    <div className="md:hidden bg-black text-white p-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2">
                            <Menu className="w-6 h-6 text-pink-500" />
                        </button>
                        <span className="font-bold text-lg tracking-wider">Fortune App</span>
                        <div className="w-8"></div>
                    </div>

                    <main className="flex-grow p-4 md:p-8 bg-gray-100 overflow-y-auto">
                        {renderContent()}
                    </main>
                </div>
              </>
          )}
        </div>
    </ErrorBoundary>
  );
};

export default App;