import { createClient, User } from '@supabase/supabase-js';
import { UserProfile, GalleryItem, Transaction } from '../types';

// YOUR SUPABASE KEYS
const SUPABASE_URL = "https://qdxcwydleatpmoouwyeh.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeGN3eWRsZWF0cG1vb3V3eWVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NjY5NDcsImV4cCI6MjA4MDM0Mjk0N30.HVdB3wi9PTZYk_a-nCZ_Tmi8Fzjr5dAj61SKEXDsxjQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function loginWithProvider(provider: 'google' | 'facebook') {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: window.location.origin,
        },
    });
    if (error) throw error;
    return data;
}

export async function signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    if (error) throw error;
    return data;
}

export async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    // Auto-create profile if missing, or handle null
    if (error || !profile) {
        // If logged in but no profile, return minimal structure or null
        // Logic for extracting name from email if profile exists but name is empty
        return null; 
    }

    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    const { data: gallery } = await supabase
        .from('gallery')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    // NAME LOGIC: Use profile.name -> profile.email (before @) -> 'User'
    let displayName = profile.name;
    if (!displayName && profile.email) {
        displayName = profile.email.split('@')[0];
    }
    if (!displayName) displayName = "New User";

    return {
        id: profile.id,
        name: displayName,
        coins: profile.coins,
        pityCount: profile.pity_count,
        lastCheckIn: profile.last_check_in,
        checkInStreak: profile.check_in_streak,
        isLoggedIn: true,
        transactions: (transactions || []).map((t: any) => ({
            id: t.id,
            date: new Date(t.created_at).toISOString().split('T')[0],
            type: t.type,
            amount: t.amount,
            description: t.description
        })),
        gallery: (gallery || []).map((g: any) => ({
            id: g.id,
            date: new Date(g.created_at).toISOString().split('T')[0],
            type: g.type,
            content: g.content,
            title: g.title
        }))
    };
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    if (updates.coins !== undefined || updates.pityCount !== undefined || updates.lastCheckIn !== undefined) {
        await supabase.from('profiles').update({
            coins: updates.coins,
            pity_count: updates.pityCount,
            last_check_in: updates.lastCheckIn,
            check_in_streak: updates.checkInStreak
        }).eq('id', userId);
    }
}

export async function addSupabaseTransaction(userId: string, tx: Transaction) {
    await supabase.from('transactions').insert({
        user_id: userId,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        created_at: new Date().toISOString()
    });
}

export async function addSupabaseGalleryItem(userId: string, item: GalleryItem) {
    await supabase.from('gallery').insert({
        user_id: userId,
        type: item.type,
        content: item.content,
        title: item.title,
        created_at: new Date().toISOString()
    });
}