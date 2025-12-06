
import { LucideIcon } from 'lucide-react';

export type LanguageCode = 'zh_TW' | 'zh_CN' | 'en';

export type PageId = 
  | 'dashboard'
  | 'dailyDraw'
  | 'tarot'
  | 'nameBlessing'
  | 'rituals'
  | 'yearlyFortune'
  | 'sageChat'
  | 'shop'
  | 'lunarCalendar'
  | 'aiStudio'
  | 'wallet'
  | 'gallery';

export interface UserStats {
  totalUsage: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'deposit' | 'spend';
  amount: number;
  description: string;
}

export interface GalleryItem {
  id: string;
  date: string;
  type: 'image' | 'video' | 'text';
  content: string; 
  title: string;
}

export interface UserProfile {
  id: string;
  name: string;
  coins: number;
  lastCheckIn: string;
  checkInStreak: number;
  pityCount: number;
  isLoggedIn: boolean;
  avatar?: string;
  transactions: Transaction[];
  gallery: GalleryItem[];
}

export interface MenuItem {
  id: PageId;
  translationKey: keyof TranslationStructure;
  icon: LucideIcon;
  badge?: number;
}

export interface MicroItem {
  id: string;
  nameKey: string;
  price: number;
  icon: any;
  type: 'text' | 'card' | 'input_wish' | 'input_question' | 'input_zodiac';
  color: string;
}

export interface TranslationStructure {
  appName: string;
  version: string;
  traditionalChinese: string;
  simplifiedChinese: string;
  english: string;
  userID: string;
  dashboard: string;
  fortuneIndex: string;
  familyHarmony: string;
  compatibility: string;
  dailyDraw: string;
  tarot: string;
  nameBlessing: string;
  rituals: string;
  yearlyFortune: string;
  merits: string;
  kindnessShare: string;
  sageChat: string;
  shop: string;
  lunarCalendar: string;
  aiStudio: string;
  wallet: string;
  gallery: string;
  welcome: string;
  totalUsage: string;
  fortuneIndexTitle: string;
  target: string;
  dailyTarget: string;
  weeklyFocus: string;
  fortuneTrend: string;
  quickGuide: string;
  guideText: string;
  drawFortune: string;
  drawing: string;
  blessing: string;
  topBlessing: string;
  topSign: string;
  middleSign: string;
  lowSign: string;
  heavenMatch: string;
  goodMatch: string;
  fateAccept: string;
  comingSoon: string;
  fortuneDesc1: string;
  fortuneDesc2: string;
  fortuneDesc3: string;
  fortuneDesc4: string;
  deepAnalysisTitle: string;
  unlockAnalysis: string; 
  unlockPrompt: string;  
  paymentProcessing: string;
  paymentSuccess: string;
  generatingAi: string;
  tarot_title: string;
  tarot_desc: string;
  tarot_start_btn: string;
  tarot_picking: string;
  tarot_reveal_title: string;
  tarot_past: string;
  tarot_present: string;
  tarot_future: string;
  tarot_unlock_btn: string;
  tarot_locked_msg: string;
  bless_inputName: string;
  bless_selectType: string;
  bless_type_health: string;
  bless_type_wealth: string;
  bless_type_love: string;
  bless_type_career: string;
  bless_generate: string;
  bless_cardTitle: string;
  bless_voice_upgrade: string;
  bless_play_voice: string;
  rituals_title: string;
  rituals_lamp_name: string;
  rituals_lamp_desc: string;
  rituals_wealth_name: string;
  rituals_wealth_desc: string;
  rituals_karmic_name: string;
  rituals_karmic_desc: string;
  rituals_perform_btn: string;
  rituals_prayer_title: string;
  rituals_audio_btn: string;
  rituals_seasonal_title: string;
  peaceLamp: string;
  lamp_title: string;
  lamp_desc: string;
  lamp_lit_msg: string;
  lamp_light_btn: string;
  yearly_title: string;
  yearly_desc: string;
  yearly_input_name: string;
  yearly_input_birth: string;
  yearly_unlock_btn: string;
  yearly_report_title: string;
  analysis_title: string;
  analysis_inputLesson: string;
  analysis_inputStability: string;
  analysis_calculate: string;
  analysis_trend: string;
  harmony_title: string;
  harmony_nicknameSubtitle: string;
  harmony_save: string;
  harmony_timeLabel: string;
  harmony_daysLabel: string;
  harmony_setReminder: string;
  comp_title: string;
  comp_yourLabel: string;
  comp_partnerLabel: string;
  comp_calc: string;
  comp_result: string;
  task_title: string;
  task_today: string;
  task_save: string;
  task_1: string;
  task_2: string;
  task_3: string;
  share_title: string;
  share_gen_title: string;
  share_placeholder: string;
  share_btn: string;
  chat_title: string;
  chat_select_deity: string;
  chat_placeholder: string;
  chat_send: string;
  chat_history_clear: string;
  deity_landgod: string;
  deity_landgod_desc: string;
  deity_wealth: string;
  deity_wealth_desc: string;
  deity_matchmaker: string;
  deity_matchmaker_desc: string;
  deity_mazu: string;
  deity_mazu_desc: string;
  deity_guanyu: string;
  deity_guanyu_desc: string;
  chat_offering_title: string;
  chat_offering_basic: string;
  chat_offering_premium: string;
  chat_unlock_btn: string;
  shop_title: string;
  shop_add: string;
  shop_checkout: string;
  shop_total: string;
  shop_pay: string;
  shop_popular: string;
  shop_plan99_name: string;
  shop_plan99_desc: string;
  shop_plan299_name: string;
  shop_plan299_desc: string;
  shop_item1_name: string;
  shop_item1_desc: string;
  shop_item2_name: string;
  shop_item2_desc: string;
  shop_item3_name: string;
  shop_item3_desc: string;
  shop_video_name: string;
  shop_video_desc: string;
  shop_wallpaper_name: string;
  shop_wallpaper_desc: string;
  shop_micro_title: string;
  shop_micro_desc: string;
  shop_delivery_title: string;
  shop_delivery_save: string;
  shop_input_wish: string;
  shop_input_question: string;
  shop_input_zodiac: string;
  festival_qingming: string;
  festival_ghost: string;
  festival_ghost_14: string;
  festival_cny: string;
  festival_lantern: string;
  festival_mazu: string;
  festival_qingming_desc: string;
  festival_ghost_desc: string;
  festival_ghost_14_desc: string;
  festival_cny_desc: string;
  festival_lantern_desc: string;
  festival_mazu_desc: string;
  calendar_title: string;
  calendar_btn: string;
  ai_studio_title: string;
  ai_studio_desc: string;
  ai_credits_balance: string;
  ai_buy_credits: string;
  ai_input_placeholder: string;
  ai_generate_image: string;
  ai_generate_video: string;
  ai_cost_image: string;
  ai_cost_video: string;
  ai_generating: string;
  ai_pack_1: string;
  ai_pack_1_desc: string;
  ai_pack_2: string;
  ai_pack_2_desc: string;
  ai_pack_3: string;
  ai_pack_3_desc: string;
  ai_badge_hot: string;
  ai_badge_best: string;
  ai_result_title: string;
  ai_error_title: string;
  ai_error_desc: string;
  ai_refund_msg: string;
  ai_bonus_msg: string;
  ai_close_btn: string;
  login_title: string;
  login_subtitle: string;
  login_google: string;
  login_facebook: string;
  checkin_title: string;
  checkin_btn: string;
  checkin_success: string;
  checkin_streak: string;
  checkin_reward: string;
  wallet_title: string;
  wallet_history: string;
  wallet_topup: string;
  wallet_spend: string;
  gallery_title: string;
  gallery_empty: string;
  support_btn: string;
}
