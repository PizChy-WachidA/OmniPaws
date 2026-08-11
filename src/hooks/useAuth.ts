import { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthUser } from '@/types';

function mapSupabaseUser(user: SupabaseUser): AuthUser {
  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name || user.user_metadata?.full_name || user.email!.split('@')[0],
    avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
    location: user.user_metadata?.location || 'Sydney, NSW',
    memberSince: user.created_at || new Date().toISOString(),
    verified: user.user_metadata?.verified || false,
    role: user.user_metadata?.role || 'owner',
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session?.user) setUser(mapSupabaseUser(session.user));
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        const mappedUser = mapSupabaseUser(session.user);
        // Ensure profile row exists
        await supabase.from('profiles').upsert({
          id: session.user.id,
          name: mappedUser.name,
          email: mappedUser.email,
          avatar: mappedUser.avatar,
          location: mappedUser.location,
          role: session.user.user_metadata?.role || 'owner',
        }, { onConflict: 'id' });
        // Re-fetch profile to get server role
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (profile) mappedUser.role = profile.role as AuthUser['role'];
        setUser(mappedUser);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  };

  const register = async (email: string, password: string, name: string, role: string = 'owner') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    if (error) throw error;
    return data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, login, register, logout };
};
