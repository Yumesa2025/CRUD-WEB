import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, session, isLoading: false });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, session, isLoading: false });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password });

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

  const signUpWithEmail = (email: string, password: string, username: string) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

  const signOut = () => supabase.auth.signOut();

  // backward compat
  const signIn = signInWithEmail;

  return { ...state, signIn, signInWithEmail, signInWithGoogle, signUpWithEmail, signOut };
}
