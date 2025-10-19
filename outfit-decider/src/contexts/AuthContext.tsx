// Authentication context with Supabase
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  onboardingCompleted: boolean;
  markOnboardingComplete: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check onboarding status from user metadata
      if (session?.user) {
        const completed = session.user.user_metadata?.onboarding_completed || false;
        setOnboardingCompleted(completed);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, 'Session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const completed = session.user.user_metadata?.onboarding_completed || false;
        setOnboardingCompleted(completed);
      } else {
        setOnboardingCompleted(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    console.log('SignUp called with email:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          onboarding_completed: false,
        },
      },
    });
    console.log('SignUp response:', { data, error });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    console.log('SignIn called with email:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('SignIn response:', { data, error });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const markOnboardingComplete = async () => {
    if (!user) return;

    const { error } = await supabase.auth.updateUser({
      data: { onboarding_completed: true },
    });

    if (error) throw error;
    setOnboardingCompleted(true);
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    onboardingCompleted,
    markOnboardingComplete,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};